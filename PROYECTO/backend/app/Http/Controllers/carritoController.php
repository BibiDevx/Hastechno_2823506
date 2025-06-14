<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrito;
use App\Models\Producto;
use App\Models\Cliente;
use Illuminate\Support\Facades\Validator;

class CarritoController extends BaseController // O simplemente extends Controller, según tu setup
{
    /**
     * Obtener el carrito del cliente autenticado o del invitado.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Carrito::with(['producto' => function($q) {
            $q->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'disponibilidad');
        }]);

        $cliente = null;
        if (auth()->user()) {
            $cliente = auth()->user()->cliente;
        }
        
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
     * Agregar un producto al carrito del cliente/invitado o actualizar su cantidad.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
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

        $cliente = null;
        if (auth()->user()) {
            $cliente = auth()->user()->cliente;
        }
        $guestId = $request->header('X-Guest-ID');

        if (!$cliente && !$guestId) {
            return $this->sendError('Unauthorized: Authentication or Guest ID is required to add to cart.', [], 401);
        }

        $idProducto = $request->input('idProducto');
        $cantidad = $request->input('cantidad');

        $producto = Producto::find($idProducto);
        if (!$producto || $producto->disponibilidad === 0) {
            return $this->sendError('The product is not available or does not exist.', [], 400);
        }

        $itemCarritoQuery = Carrito::where('idProducto', $idProducto);

        if ($cliente) {
            $itemCarritoQuery->where('idCliente', $cliente->idCliente);
        } else {
            $itemCarritoQuery->whereNull('idCliente')->where('guest_id', $guestId);
        }
        
        $itemCarrito = $itemCarritoQuery->first();

        if ($itemCarrito) {
            $itemCarrito->cantidad += $cantidad;
            $itemCarrito->save();
        } else {
            $itemCarrito = Carrito::create([
                'idCliente' => $cliente ? $cliente->idCliente : null,
                'idProducto' => $idProducto,
                'cantidad' => $cantidad,
                'guest_id' => $guestId,
            ]);
        }
        
        $itemCarrito->load(['producto' => function($q) {
            $q->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'disponibilidad');
        }]);

        return $this->sendResponse($itemCarrito, 'Product added/updated in cart successfully.');
    }

    /**
     * Actualizar la cantidad de un producto específico en el carrito.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $idCarrito  El ID del ítem del carrito
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $idCarrito)
    {
        $validator = Validator::make($request->all(), [
            'cantidad' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Errors.', $validator->errors(), 422);
        }

        $cliente = null;
        if (auth()->user()) {
            $cliente = auth()->user()->cliente;
        }
        $guestId = $request->header('X-Guest-ID');

        if (!$cliente && !$guestId) {
            return $this->sendError('Unauthorized: Authentication or Guest ID is required to update the cart.', [], 401);
        }

        $itemCarritoQuery = Carrito::where('idCarrito', $idCarrito);

        if ($cliente) {
            $itemCarritoQuery->where('idCliente', $cliente->idCliente);
        } else {
            $itemCarritoQuery->whereNull('idCliente')->where('guest_id', $guestId);
        }
        
        $itemCarrito = $itemCarritoQuery->first();

        if (!$itemCarrito) {
            return $this->sendError('Cart item not found or does not belong to this client/guest.', [], 404);
        }

        $nuevaCantidad = $request->input('cantidad');

        if ($nuevaCantidad <= 0) {
            $itemCarrito->delete();
            return $this->sendResponse(['idCarrito' => $idCarrito, 'removed' => true], 'Product removed from cart successfully.');
        }

        $itemCarrito->cantidad = $nuevaCantidad;
        $itemCarrito->save();

        $itemCarrito->load(['producto' => function($q) {
            $q->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'disponibilidad');
        }]);

        return $this->sendResponse($itemCarrito, 'Product quantity updated successfully.');
    }

    /**
     * Eliminar un producto específico del carrito.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $idCarrito  El ID del ítem del carrito a eliminar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $idCarrito)
    {
        $cliente = null;
        if (auth()->user()) {
            $cliente = auth()->user()->cliente;
        }
        $guestId = $request->header('X-Guest-ID');

        if (!$cliente && !$guestId) {
            return $this->sendError('Unauthorized: Authentication or Guest ID is required to remove from cart.', [], 401);
        }

        $itemCarritoQuery = Carrito::where('idCarrito', $idCarrito);

        if ($cliente) {
            $itemCarritoQuery->where('idCliente', $cliente->idCliente);
        } else {
            $itemCarritoQuery->whereNull('idCliente')->where('guest_id', $guestId);
        }
        
        $itemCarrito = $itemCarritoQuery->first();

        if (!$itemCarrito) {
            return $this->sendError('Cart item not found or does not belong to this client/guest.', [], 404);
        }

        $itemCarrito->delete();

        return $this->sendResponse([], 'Product removed from cart successfully.');
    }

    /**
     * Vaciar completamente el carrito del cliente autenticado o del invitado.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCart(Request $request)
    {
        $cliente = null;
        if (auth()->user()) {
            $cliente = auth()->user()->cliente;
        }
        $guestId = $request->header('X-Guest-ID');

        if (!$cliente && !$guestId) {
            return $this->sendError('Unauthorized: Authentication or Guest ID is required to clear the cart.', [], 401);
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
     * Fusionar el carrito de invitado con el carrito del cliente al iniciar sesión.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function mergeGuestCart(Request $request)
    {
        // ✅ VALIDACIÓN CORREGIDA: Solo verificamos que sea requerido y un UUID válido.
        // No verificamos 'exists' aquí, lo haremos manualmente después.
        $validator = Validator::make($request->all(), [
            'guest_id' => 'required|uuid', 
        ]);

        if ($validator->fails()) {
            // ✅ Retorna los errores de validación específicos si el formato es incorrecto
            return $this->sendError('Validation Errors.', $validator->errors(), 422); 
        }
        
        $cliente = auth()->user() ? auth()->user()->cliente : null;
        if (!$cliente) {
            return $this->sendError('Client profile not found for the authenticated user. Cannot merge cart.', [], 404);
        }

        $guestId = $request->input('guest_id');

        // ✅ Lógica para manejar si no hay ítems de invitado para este guest_id
        $hasGuestItems = Carrito::whereNull('idCliente')
                                ->where('guest_id', $guestId)
                                ->exists();

        if (!$hasGuestItems) {
            // Si no hay ítems para este guest_id, simplemente devolvemos el carrito actual del usuario
            $userCart = Carrito::with(['producto' => function($q) {
                $q->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'disponibilidad');
            }])
            ->where('idCliente', $cliente->idCliente)
            ->get();
            return $this->sendResponse($userCart, 'No guest cart items to merge. Returning user cart.');
        }

        $guestCartItems = Carrito::whereNull('idCliente')
                                ->where('guest_id', $guestId)
                                ->get();

        foreach ($guestCartItems as $guestItem) {
            $existingUserCartItem = Carrito::where('idCliente', $cliente->idCliente)
                                            ->where('idProducto', $guestItem->idProducto)
                                            ->first();

            if ($existingUserCartItem) {
                $existingUserCartItem->cantidad += $guestItem->cantidad;
                $existingUserCartItem->save();
                $guestItem->delete();
            } else {
                $guestItem->idCliente = $cliente->idCliente;
                $guestItem->guest_id = null;
                $guestItem->save();
            }
        }
        
        // Limpia cualquier ítem de invitado restante con ese guest_id
        Carrito::whereNull('idCliente')->where('guest_id', $guestId)->delete();


        $updatedCart = Carrito::with(['producto' => function($q) {
            $q->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'disponibilidad');
        }])
        ->where('idCliente', $cliente->idCliente)
        ->get();

        return $this->sendResponse($updatedCart, 'Guest cart merged successfully.');
    }
}
