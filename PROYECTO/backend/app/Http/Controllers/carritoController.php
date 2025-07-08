<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrito;
use App\Models\Producto;
use App\Models\Cliente;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Carrito",
 *     description="Operaciones del carrito de compras para clientes e invitados"
 * )
 */
class carritoController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/carrito",
     *     tags={"Carrito"},
     *     summary="Obtener carrito",
     *     description="Obtiene el carrito del cliente autenticado o del invitado con X-Guest-ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="X-Guest-ID",
     *         in="header",
     *         required=false,
     *         description="UUID del carrito de invitado",
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Carrito obtenido exitosamente"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Carrito::with(['producto' => function($q) {
            $q->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'disponibilidad');
        }]);

        $cliente = auth()->user() ? auth()->user()->cliente : null;
        $guestId = $request->header('X-Guest-ID');

        if ($cliente) {
            $query->where('idCliente', $cliente->idCliente);
        } elseif ($guestId) {
            $query->whereNull('idCliente')->where('guest_id', $guestId);
        } else {
            return $this->sendError('Unauthorized: Authentication or Guest ID is required to retrieve the cart.', [], 401);
        }

        $carrito = $query->get();
        return $this->sendResponse($carrito, 'Cart retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/carrito",
     *     tags={"Carrito"},
     *     summary="Agregar producto al carrito",
     *     description="Agrega o actualiza la cantidad de un producto en el carrito del cliente o invitado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="X-Guest-ID",
     *         in="header",
     *         required=false,
     *         description="UUID del carrito de invitado",
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"idProducto", "cantidad"},
     *             @OA\Property(property="idProducto", type="integer"),
     *             @OA\Property(property="cantidad", type="integer", minimum=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Producto agregado/actualizado en el carrito"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Errores de validación"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idProducto' => 'required|exists:producto,idProducto',
            'cantidad' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Errors.', $validator->errors(), 422);
        }

        $cliente = auth()->user() ? auth()->user()->cliente : null;
        $guestId = $request->header('X-Guest-ID');

        if (!$cliente && !$guestId) {
            return $this->sendError('Unauthorized: Authentication or Guest ID is required to add to cart.', [], 401);
        }

        $producto = Producto::find($request->idProducto);
        if (!$producto || $producto->disponibilidad === 0) {
            return $this->sendError('The product is not available or does not exist.', [], 400);
        }

        $query = Carrito::where('idProducto', $request->idProducto);
        if ($cliente) {
            $query->where('idCliente', $cliente->idCliente);
        } else {
            $query->whereNull('idCliente')->where('guest_id', $guestId);
        }

        $item = $query->first();
        if ($item) {
            $item->cantidad += $request->cantidad;
            $item->save();
        } else {
            $item = Carrito::create([
                'idCliente' => $cliente ? $cliente->idCliente : null,
                'idProducto' => $request->idProducto,
                'cantidad' => $request->cantidad,
                'guest_id' => $guestId,
            ]);
        }

        $item->load('producto:idProducto,nombreProducto,valorProducto,definicion,disponibilidad');
        return $this->sendResponse($item, 'Product added/updated in cart successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/carrito/{idCarrito}",
     *     tags={"Carrito"},
     *     summary="Actualizar cantidad en el carrito",
     *     description="Actualiza la cantidad de un producto específico en el carrito",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="idCarrito",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"cantidad"},
     *             @OA\Property(property="cantidad", type="integer", minimum=0)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cantidad actualizada o producto eliminado"),
     *     @OA\Response(response=404, description="Item no encontrado")
     * )
     */
    public function update(Request $request, $idCarrito)
    {
        $validator = Validator::make($request->all(), [
            'cantidad' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Errors.', $validator->errors(), 422);
        }

        $cliente = auth()->user() ? auth()->user()->cliente : null;
        $guestId = $request->header('X-Guest-ID');

        if (!$cliente && !$guestId) {
            return $this->sendError('Unauthorized.', [], 401);
        }

        $query = Carrito::where('idCarrito', $idCarrito);
        if ($cliente) {
            $query->where('idCliente', $cliente->idCliente);
        } else {
            $query->whereNull('idCliente')->where('guest_id', $guestId);
        }

        $item = $query->first();
        if (!$item) {
            return $this->sendError('Cart item not found.', [], 404);
        }

        if ($request->cantidad <= 0) {
            $item->delete();
            return $this->sendResponse(['idCarrito' => $idCarrito, 'removed' => true], 'Product removed from cart successfully.');
        }

        $item->cantidad = $request->cantidad;
        $item->save();
        $item->load('producto:idProducto,nombreProducto,valorProducto,definicion,disponibilidad');

        return $this->sendResponse($item, 'Product quantity updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/carrito/{idCarrito}",
     *     tags={"Carrito"},
     *     summary="Eliminar producto del carrito",
     *     description="Elimina un producto específico del carrito",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="idCarrito",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Producto eliminado del carrito"),
     *     @OA\Response(response=404, description="No encontrado")
     * )
     */
    public function destroy(Request $request, $idCarrito)
    {
        $cliente = auth()->user() ? auth()->user()->cliente : null;
        $guestId = $request->header('X-Guest-ID');

        if (!$cliente && !$guestId) {
            return $this->sendError('Unauthorized.', [], 401);
        }

        $query = Carrito::where('idCarrito', $idCarrito);
        if ($cliente) {
            $query->where('idCliente', $cliente->idCliente);
        } else {
            $query->whereNull('idCliente')->where('guest_id', $guestId);
        }

        $item = $query->first();
        if (!$item) {
            return $this->sendError('Cart item not found.', [], 404);
        }

        $item->delete();
        return $this->sendResponse([], 'Product removed from cart successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/carrito/clear",
     *     tags={"Carrito"},
     *     summary="Vaciar carrito",
     *     description="Vacía todo el carrito del cliente o invitado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Carrito vaciado correctamente")
     * )
     */
    public function clearCart(Request $request)
    {
        $cliente = auth()->user() ? auth()->user()->cliente : null;
        $guestId = $request->header('X-Guest-ID');

        if (!$cliente && !$guestId) {
            return $this->sendError('Unauthorized.', [], 401);
        }

        $query = Carrito::query();
        if ($cliente) {
            $query->where('idCliente', $cliente->idCliente);
        } else {
            $query->whereNull('idCliente')->where('guest_id', $guestId);
        }

        $query->delete();
        return $this->sendResponse([], 'Cart cleared successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/carrito/merge",
     *     tags={"Carrito"},
     *     summary="Fusionar carrito de invitado con autenticado",
     *     description="Fusiona el carrito de un invitado con el del usuario autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"guest_id"},
     *             @OA\Property(property="guest_id", type="string", format="uuid")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Carrito fusionado correctamente")
     * )
     */
    public function mergeGuestCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guest_id' => 'required|uuid',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Errors.', $validator->errors(), 422);
        }

        $cliente = auth()->user() ? auth()->user()->cliente : null;
        if (!$cliente) {
            return $this->sendError('Client profile not found.', [], 404);
        }

        $guestId = $request->input('guest_id');

        $guestItems = Carrito::whereNull('idCliente')->where('guest_id', $guestId)->get();

        if ($guestItems->isEmpty()) {
            $userCart = Carrito::with('producto:idProducto,nombreProducto,valorProducto,definicion,disponibilidad')
                ->where('idCliente', $cliente->idCliente)->get();

            return $this->sendResponse($userCart, 'No guest cart items to merge. Returning user cart.');
        }

        foreach ($guestItems as $guestItem) {
            $existing = Carrito::where('idCliente', $cliente->idCliente)
                ->where('idProducto', $guestItem->idProducto)
                ->first();

            if ($existing) {
                $existing->cantidad += $guestItem->cantidad;
                $existing->save();
                $guestItem->delete();
            } else {
                $guestItem->idCliente = $cliente->idCliente;
                $guestItem->guest_id = null;
                $guestItem->save();
            }
        }

        Carrito::whereNull('idCliente')->where('guest_id', $guestId)->delete();

        $updatedCart = Carrito::with('producto:idProducto,nombreProducto,valorProducto,definicion,disponibilidad')
            ->where('idCliente', $cliente->idCliente)->get();

        return $this->sendResponse($updatedCart, 'Guest cart merged successfully.');
    }
}
