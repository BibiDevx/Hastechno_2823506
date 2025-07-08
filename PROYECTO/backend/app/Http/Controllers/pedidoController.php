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
use Illuminate\Support\Facades\Log; // Para depuración
use Illuminate\Support\Facades\Validator; // Para validación

/**
 * @OA\Tag(
 * name="Pedidos",
 * description="Operaciones relacionadas con la gestión de pedidos de clientes."
 * )
 *
 * @OA\Schema(
 * schema="PedidoProductoInput",
 * title="Producto para Pedido",
 * description="Detalles de un producto a incluir en un nuevo pedido.",
 * required={"idProducto", "cantidad"},
 * @OA\Property(property="idProducto", type="integer", format="int64", description="ID del producto.", example=1),
 * @OA\Property(property="cantidad", type="integer", description="Cantidad del producto.", example=2)
 * )
 *
 * @OA\Schema(
 * schema="PedidoInput",
 * title="Entrada de Pedido",
 * description="Datos necesarios para crear un nuevo pedido.",
 * required={"productos", "metodo_pago"},
 * @OA\Property(
 * property="productos",
 * type="array",
 * @OA\Items(ref="#/components/schemas/PedidoProductoInput"),
 * description="Lista de productos a incluir en el pedido."
 * ),
 * @OA\Property(property="metodo_pago", type="string", maxLength=50, description="Método de pago para el pedido.", example="Tarjeta de Crédito")
 * )
 *
 * @OA\Schema(
 * schema="PedidoResponseDetailed",
 * title="Pedido Detallado",
 * description="Representación completa de un pedido con sus productos y factura.",
 * allOf={
 * @OA\Schema(ref="#/components/schemas/Pedido"),
 * @OA\Schema(
 * @OA\Property(
 * property="productos",
 * type="array",
 * @OA\Items(
 * type="object",
 * allOf={
 * @OA\Schema(ref="#/components/schemas/PedidoProducto"),
 * @OA\Schema(
 * @OA\Property(property="producto", ref="#/components/schemas/Producto", description="Detalles del producto asociado.")
 * )
 * }
 * ),
 * description="Lista de ítems de productos en el pedido, con detalles del producto."
 * ),
 * @OA\Property(property="factura", ref="#/components/schemas/Factura", description="Detalles de la factura asociada al pedido.")
 * )
 * }
 * )
 *
 * @OA\Schema(
 * schema="PedidoProductoWithProduct",
 * title="Pedido Producto con Detalles de Producto",
 * description="Representa un ítem de producto dentro de un pedido, incluyendo los detalles completos del producto.",
 * allOf={
 * @OA\Schema(ref="#/components/schemas/PedidoProducto"),
 * @OA\Schema(
 * @OA\Property(property="producto", ref="#/components/schemas/Producto", description="Detalles del producto asociado al ítem del pedido.")
 * )
 * }
 * )
 */
class pedidoController extends BaseController
{
    /**
     * @OA\Post(
     * path="/api/p/pedidos",
     * summary="Realizar un nuevo pedido",
     * tags={"Pedidos"},
     * security={{"bearerAuth": {}}},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para crear un nuevo pedido.",
     * @OA\JsonContent(ref="#/components/schemas/PedidoInput")
     * ),
     * @OA\Response(
     * response=201,
     * description="Pedido realizado y factura generada exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Pedido realizado y factura generada exitosamente."),
     * @OA\Property(property="pedido", ref="#/components/schemas/PedidoResponseDetailed")
     * )
     * ),
     * @OA\Response(
     * response=400,
     * description="Errores en la solicitud (producto no encontrado, stock insuficiente, cliente no asociado).",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Stock insuficiente para: Producto X"),
     * @OA\Property(property="errors", type="object", nullable=true, description="Detalles de errores de validación si aplica.")
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Debes iniciar sesión para realizar un pedido.")
     * )
     * ),
     * @OA\Response(
     * response=422,
     * description="Errores de validación de los datos de entrada.",
     * @OA\JsonContent(ref="#/components/schemas/ValidationError")
     * ),
     * @OA\Response(
     * response=500,
     * description="Error interno del servidor al procesar el pedido.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Error al procesar el pedido: Mensaje de error interno.")
     * )
     * )
     * )
     */
    public function store(Request $request)
    {
        Log::info('pedidoController@store - Solicitud de pedido recibida', ['request_data' => $request->all()]);

        // 1. Validar la solicitud (Añadido 'metodo_pago')
        $validator = Validator::make($request->all(), [
            'productos' => 'required|array',
            'productos.*.idProducto' => 'required|integer|exists:producto,idProducto', 
            'productos.*.cantidad' => 'required|integer|min:1',
            'metodo_pago' => 'required|string|max:50', // ✅ AÑADIDA VALIDACIÓN PARA MÉTODO DE PAGO
        ]);

        if ($validator->fails()) {
            Log::error('pedidoController@store - Errores de validación:', ['errors' => $validator->errors()->all()]);
            return response()->json(['message' => 'Errores de validación', 'errors' => $validator->errors()], 422);
        }

        // 2. Obtener el ID del cliente autenticado
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

        DB::beginTransaction(); // Iniciar una transacción de base de datos

        try {
            // 3. Crear el registro principal del Pedido
            $pedido = Pedido::create([
                'idCliente' => $idCliente,
                'fechaPedido' => now(), // Fecha y hora actual
            ]);
            Log::info('pedidoController@store - Pedido principal creado:', ['pedido_id' => $pedido->idPedido]);

            // Se elimina $totalPedidoCalculado ya que no se usará en Factura::create()
            // $totalPedidoCalculado = 0; 

            // 4. Procesar los productos y guardarlos en la tabla 'pedidoproducto'
            foreach ($request->productos as $item) {
                $producto = Producto::find($item['idProducto']);

                // Verificar si el producto existe
                if (!$producto) {
                    DB::rollBack();
                    Log::error('pedidoController@store - Producto no encontrado con ID:', ['idProducto' => $item['idProducto']]);
                    return response()->json(['message' => 'Producto no encontrado: ID ' . $item['idProducto']], 400);
                }
                
                // Verificar stock usando 'cantidadStock'
                if ($producto->cantidadStock < $item['cantidad']) { 
                    DB::rollBack();
                    Log::error('pedidoController@store - Stock insuficiente para producto:', [
                        'idProducto' => $producto->idProducto,
                        'solicitado' => $item['cantidad'],
                        'stock_actual' => $producto->cantidadStock
                    ]);
                    return response()->json(['message' => 'Stock insuficiente para: ' . $producto->nombreProducto], 400);
                }

                // Calcular el valor total para esta línea de producto (se mantiene para PedidoProducto)
                $valorTotalProducto = $producto->valorProducto * $item['cantidad'];
                // Ya no se suma a $totalPedidoCalculado
                // $totalPedidoCalculado += $valorTotalProducto; 

                // Crear el registro en la tabla 'pedidoproducto'
                PedidoProducto::create([
                    'idPedido' => $pedido->idPedido,
                    'idProducto' => $item['idProducto'],
                    'cantidadProducto' => $item['cantidad'],
                    'valorTotal' => $valorTotalProducto,
                ]);
                Log::info('pedidoController@store - Detalle de pedido añadido:', ['idPedido' => $pedido->idPedido, 'idProducto' => $item['idProducto'], 'cantidad' => $item['cantidad']]);

                // Restar de 'cantidadStock'
                $producto->cantidadStock -= $item['cantidad'];
                
                // Actualizar 'disponibilidad' SOLO si el stock llega a 0 o menos
                if ($producto->cantidadStock <= 0) {
                    $producto->disponibilidad = 0; // Marcar como no disponible
                } else {
                    $producto->disponibilidad = 1; // Asegurarse de que esté disponible si hay stock > 0
                }
                $producto->save();
                Log::info('pedidoController@store - Stock y disponibilidad actualizados para producto:', [
                    'idProducto' => $producto->idProducto,
                    'nuevo_stock' => $producto->cantidadStock,
                    'nueva_disponibilidad' => $producto->disponibilidad
                ]);
            }

            // 6. Generar la Factura (Eliminado 'totalFactura')
            Factura::create([
                'idPedido' => $pedido->idPedido,
                'fechaFactura' => now(), 
                'metodoPago' => $request->input('metodo_pago'), // ✅ GUARDA EL MÉTODO DE PAGO
                // 'totalFactura' => $totalPedidoCalculado,      // ❌ ELIMINADO: Ya no se guarda el total de factura aquí
                // Aquí podrías generar 'numeroFactura' si es autogenerado por el backend
                // 'numeroFactura' => 'FAC-' . str_pad($pedido->idPedido, 5, '0', STR_PAD_LEFT) . '-' . now()->format('Ymd'), 
            ]);
            Log::info('pedidoController@store - Factura generada para pedido:', [
                'idPedido' => $pedido->idPedido, 
                'metodoPago' => $request->input('metodo_pago'),
                // 'totalFactura' => $totalPedidoCalculado // ❌ ELIMINADO del log
            ]);

            // 7. Vaciar el carrito del cliente (solo los ítems de ese cliente)
            Carrito::where('idCliente', $idCliente)->delete();
            Log::info('pedidoController@store - Carrito vaciado para cliente:', ['idCliente' => $idCliente]);

            DB::commit(); // Confirmar la transacción: todos los cambios se guardan permanentemente

            return response()->json([
                'message' => 'Pedido realizado y factura generada exitosamente.',
                // Carga las relaciones pedidoproducto y factura para la respuesta
                'pedido' => $pedido->load('productos.producto', 'factura') 
            ], 201); // 201 Created: Indica que un nuevo recurso ha sido creado

        } catch (\Exception $e) {
            DB::rollBack(); // Revertir la transacción: deshace todos los cambios
            Log::error('pedidoController@store - Excepción capturada:', [
                'mensaje' => $e->getMessage(),
                'archivo' => $e->getFile(),
                'línea' => $e->getLine(),
                'traza' => $e->getTraceAsString(), // Traza completa de la pila para depuración
            ]);
            return response()->json(['message' => 'Error al procesar el pedido: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     * path="/api/p/pedidos",
     * summary="Obtener todos los pedidos del cliente autenticado",
     * tags={"Pedidos"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Lista de pedidos obtenida exitosamente.",
     * @OA\JsonContent(
     * type="array",
     * @OA\Items(ref="#/components/schemas/PedidoResponseDetailed")
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="Cliente no autenticado o sin información de cliente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Cliente no autenticado o sin información de cliente.")
     * )
     * )
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
     * path="/api/p/pedidos/{id}",
     * summary="Obtener un pedido específico del cliente autenticado por ID",
     * tags={"Pedidos"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del pedido a obtener.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Pedido encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/PedidoResponseDetailed")
     * ),
     * @OA\Response(
     * response=401,
     * description="Cliente no autenticado o sin información de cliente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Cliente no autenticado o sin información de cliente.")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Pedido no encontrado o no pertenece a este cliente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Pedido no encontrado o no pertenece a este cliente.")
     * )
     * )
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
     * path="/api/p/mis-productos-comprados",
     * summary="Obtener todos los ítems de productos comprados por el cliente autenticado",
     * tags={"Pedidos"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Lista de ítems de productos comprados obtenida exitosamente.",
     * @OA\JsonContent(
     * type="array",
     * @OA\Items(ref="#/components/schemas/PedidoProductoWithProduct")
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="Cliente no autenticado o sin información de cliente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Cliente no autenticado o sin información de cliente.")
     * )
     * )
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
     * path="/api/admin/pedidos/",
     * summary="Obtener todos los pedidos con detalles para administración (solo SuperAdmin)",
     * tags={"Pedidos", "Administración"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Pedidos obtenidos exitosamente para administración.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/PedidoResponseDetailed"))
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=403,
     * description="No autorizado (solo SuperAdmin).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function lista()
    {
        Log::info('PedidoController@indexAdmin - Solicitud para obtener todos los pedidos de administración.');

        $pedidos = Pedido::with([
            //  CARGA LA RELACIÓN 'cliente' y selecciona las columnas de nombre y apellido
            'cliente:idCliente,nombreCliente,apellidoCliente', 
            // CARGA LA RELACIÓN 'productos' (que es PedidoProducto)
            // Y DENTRO DE ELLA, CARGA LA RELACIÓN 'producto' (el Producto real)
            'productos.producto:idProducto,nombreProducto,valorProducto', 
            // CARGA LA RELACIÓN 'factura'
            'factura' 
        ])
        ->orderBy('fechaPedido', 'desc') // Ordena por fecha del pedido, más reciente primero
        ->get();

        Log::info('PedidoController@indexAdmin - Pedidos obtenidos exitosamente.', ['count' => $pedidos->count()]);
        return response()->json(['data' => $pedidos], 200);
    }
}
