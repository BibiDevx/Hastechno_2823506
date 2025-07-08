<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\PedidoProducto;
use App\Models\Factura;
use App\Models\Producto;
use App\Models\Carrito;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Pedidos",
 *     description="Gestión de pedidos de clientes y administración"
 * )
 */
class pedidoController extends BaseController
{
    /**
     * @OA\Post(
     *     path="/api/pedidos",
     *     summary="Realiza un nuevo pedido",
     *     tags={"Pedidos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"productos", "metodo_pago"},
     *             @OA\Property(
     *                 property="productos",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="idProducto", type="integer", example=1),
     *                     @OA\Property(property="cantidad", type="integer", example=2)
     *                 )
     *             ),
     *             @OA\Property(property="metodo_pago", type="string", example="Tarjeta de crédito")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Pedido realizado y factura generada exitosamente"),
     *     @OA\Response(response=400, description="Error de validación o stock insuficiente"),
     *     @OA\Response(response=401, description="Usuario no autenticado"),
     *     @OA\Response(response=500, description="Error interno al procesar el pedido")
     * )
     */
    public function store(Request $request)
    {
        Log::info('pedidoController@store - Solicitud de pedido recibida', ['request_data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'productos' => 'required|array',
            'productos.*.idProducto' => 'required|integer|exists:producto,idProducto', 
            'productos.*.cantidad' => 'required|integer|min:1',
            'metodo_pago' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            Log::error('pedidoController@store - Errores de validación:', ['errors' => $validator->errors()->all()]);
            return response()->json(['message' => 'Errores de validación', 'errors' => $validator->errors()], 422);
        }

        $user = Auth::user();

        if (!$user) {
            Log::error('pedidoController@store - Usuario no autenticado.');
            return response()->json(['message' => 'Debes iniciar sesión para realizar un pedido.'], 401);
        }

        $cliente = $user->cliente; 

        if (!$cliente) {
            Log::error('pedidoController@store - No se encontró objeto Cliente asociado para User ID:', ['user_id' => $user->idUsuario ?? 'N/A']);
            return response()->json(['message' => 'No se encontró información de cliente asociada a tu usuario. Por favor, completa tu perfil.'], 400);
        }

        $idCliente = $cliente->idCliente;
        Log::info('pedidoController@store - Cliente ID obtenido:', ['cliente_id' => $idCliente]);

        DB::beginTransaction();

        try {
            $pedido = Pedido::create([
                'idCliente' => $idCliente,
                'fechaPedido' => now(),
            ]);
            Log::info('pedidoController@store - Pedido principal creado:', ['pedido_id' => $pedido->idPedido]);

            foreach ($request->productos as $item) {
                $producto = Producto::find($item['idProducto']);

                if (!$producto) {
                    DB::rollBack();
                    Log::error('pedidoController@store - Producto no encontrado con ID:', ['idProducto' => $item['idProducto']]);
                    return response()->json(['message' => 'Producto no encontrado: ID ' . $item['idProducto']], 400);
                }
                
                if ($producto->cantidadStock < $item['cantidad']) {
                    DB::rollBack();
                    Log::error('pedidoController@store - Stock insuficiente para producto:', [
                        'idProducto' => $producto->idProducto,
                        'solicitado' => $item['cantidad'],
                        'stock_actual' => $producto->cantidadStock
                    ]);
                    return response()->json(['message' => 'Stock insuficiente para: ' . $producto->nombreProducto], 400);
                }

                $valorTotalProducto = $producto->valorProducto * $item['cantidad'];

                PedidoProducto::create([
                    'idPedido' => $pedido->idPedido,
                    'idProducto' => $item['idProducto'],
                    'cantidadProducto' => $item['cantidad'],
                    'valorTotal' => $valorTotalProducto,
                ]);
                Log::info('pedidoController@store - Detalle de pedido añadido:', ['idPedido' => $pedido->idPedido, 'idProducto' => $item['idProducto'], 'cantidad' => $item['cantidad']]);

                $producto->cantidadStock -= $item['cantidad'];
                $producto->disponibilidad = $producto->cantidadStock <= 0 ? 0 : 1;
                $producto->save();
                Log::info('pedidoController@store - Stock y disponibilidad actualizados para producto:', [
                    'idProducto' => $producto->idProducto,
                    'nuevo_stock' => $producto->cantidadStock,
                    'nueva_disponibilidad' => $producto->disponibilidad
                ]);
            }

            Factura::create([
                'idPedido' => $pedido->idPedido,
                'fechaFactura' => now(), 
                'metodoPago' => $request->input('metodo_pago'),
            ]);
            Log::info('pedidoController@store - Factura generada para pedido:', [
                'idPedido' => $pedido->idPedido, 
                'metodoPago' => $request->input('metodo_pago'),
            ]);

            Carrito::where('idCliente', $idCliente)->delete();
            Log::info('pedidoController@store - Carrito vaciado para cliente:', ['idCliente' => $idCliente]);

            DB::commit();

            return response()->json([
                'message' => 'Pedido realizado y factura generada exitosamente.',
                'pedido' => $pedido->load('productos.producto', 'factura') 
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('pedidoController@store - Excepción capturada:', [
                'mensaje' => $e->getMessage(),
                'archivo' => $e->getFile(),
                'línea' => $e->getLine(),
                'traza' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Error al procesar el pedido: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/pedidos",
     *     summary="Lista de pedidos del cliente autenticado",
     *     tags={"Pedidos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista de pedidos con sus detalles"),
     *     @OA\Response(response=401, description="Cliente no autenticado")
     * )
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->cliente) {
            return response()->json(['message' => 'Cliente no autenticado o sin información de cliente.'], 401);
        }
        $idCliente = $user->cliente->idCliente;

        $pedidos = Pedido::where('idCliente', $idCliente)
                         ->with('productos.producto', 'factura') 
                         ->orderBy('fechaPedido', 'desc')
                         ->get();

        return response()->json($pedidos);
    }

    /**
     * @OA\Get(
     *     path="/api/pedidos/{id}",
     *     summary="Ver detalles de un pedido del cliente autenticado",
     *     tags={"Pedidos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del pedido",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Detalles del pedido"),
     *     @OA\Response(response=401, description="Cliente no autenticado"),
     *     @OA\Response(response=404, description="Pedido no encontrado o no pertenece al cliente")
     * )
     */
    public function show($id)
    {
        $user = Auth::user();
        if (!$user || !$user->cliente) {
            return response()->json(['message' => 'Cliente no autenticado o sin información de cliente.'], 401);
        }
        $idCliente = $user->cliente->idCliente;

        $pedido = Pedido::where('idPedido', $id)
                         ->where('idCliente', $idCliente) 
                         ->with('productos.producto', 'factura')
                         ->first();

        if (!$pedido) {
            return response()->json(['message' => 'Pedido no encontrado o no pertenece a este cliente.'], 404);
        }

        return response()->json($pedido);
    }

    /**
     * @OA\Get(
     *     path="/api/pedidos/compras",
     *     summary="Obtener productos comprados por el cliente autenticado",
     *     tags={"Pedidos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista de productos comprados"),
     *     @OA\Response(response=401, description="Cliente no autenticado")
     * )
     */
    public function getUserPurchaseItems(Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->cliente) {
            return response()->json(['message' => 'Cliente no autenticado o sin información de cliente.'], 401);
        }

        $idCliente = $user->cliente->idCliente;

        $pedidoIds = Pedido::where('idCliente', $idCliente)->pluck('idPedido');

        if ($pedidoIds->isEmpty()) {
            return response()->json([]);
        }

        $items = PedidoProducto::whereIn('idPedido', $pedidoIds)
                               ->with('producto') 
                               ->get();

        return response()->json($items);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/pedidos",
     *     summary="Obtener todos los pedidos (admin)",
     *     tags={"Pedidos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista completa de pedidos")
     * )
     */
    public function lista()
    {
        Log::info('PedidoController@indexAdmin - Solicitud para obtener todos los pedidos de administración.');

        $pedidos = Pedido::with([
            'cliente:idCliente,nombreCliente,apellidoCliente', 
            'productos.producto:idProducto,nombreProducto,valorProducto', 
            'factura' 
        ])
        ->orderBy('fechaPedido', 'desc')
        ->get();

        Log::info('PedidoController@indexAdmin - Pedidos obtenidos exitosamente.', ['count' => $pedidos->count()]);
        return response()->json(['data' => $pedidos], 200);
    }
}
