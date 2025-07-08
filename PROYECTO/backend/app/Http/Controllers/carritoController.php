<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrito;
use App\Models\Producto;
use App\Models\Cliente;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 * name="Carrito de Compras",
 * description="Operaciones para gestionar el carrito de compras de clientes y usuarios invitados."
 * )
 *
 * @OA\Schema(
 * schema="ProductInCartDetails",
 * title="Detalles de Producto en Carrito",
 * description="Representación simplificada de un producto tal como aparece en un ítem del carrito.",
 * @OA\Property(property="idProducto", type="integer", format="int64", description="ID único del producto."),
 * @OA\Property(property="nombreProducto", type="string", description="Nombre del producto."),
 * @OA\Property(property="valorProducto", type="number", format="float", description="Precio del producto."),
 * @OA\Property(property="definicion", type="string", description="Descripción del producto."),
 * @OA\Property(property="disponibilidad", type="boolean", description="Indica si el producto está disponible.")
 * )
 *
 * @OA\Schema(
 * schema="CartItemWithProduct",
 * title="Ítem del Carrito con Producto",
 * description="Un ítem individual en el carrito de compras, incluyendo los detalles del producto asociado.",
 * allOf={
 * @OA\Schema(ref="#/components/schemas/Carrito"),
 * @OA\Schema(
 * @OA\Property(
 * property="producto",
 * ref="#/components/schemas/ProductInCartDetails",
 * description="Detalles del producto asociado a este ítem del carrito."
 * )
 * )
 * }
 * )
 *
 * @OA\Schema(
 * schema="AddToCartInput",
 * title="Entrada para Añadir/Actualizar Carrito",
 * description="Datos para añadir un producto al carrito o actualizar su cantidad.",
 * required={"idProducto", "cantidad"},
 * @OA\Property(property="idProducto", type="integer", format="int64", description="ID del producto a añadir/actualizar.", example=1),
 * @OA\Property(property="cantidad", type="integer", minLength=1, description="Cantidad del producto.", example=1)
 * )
 *
 * @OA\Schema(
 * schema="UpdateCartItemInput",
 * title="Entrada para Actualizar Cantidad en Carrito",
 * description="Datos para actualizar la cantidad de un ítem existente en el carrito.",
 * required={"cantidad"},
 * @OA\Property(property="cantidad", type="integer", minLength=0, description="Nueva cantidad del producto. Si es 0, el producto se eliminará del carrito.", example=3)
 * )
 *
 * @OA\Schema(
 * schema="MergeGuestCartInput",
 * title="Entrada para Fusionar Carrito de Invitado",
 * description="Datos para fusionar un carrito de invitado con el carrito de un usuario autenticado.",
 * required={"guest_id"},
 * @OA\Property(property="guest_id", type="string", format="uuid", description="ID único del usuario invitado.", example="a1b2c3d4-e5f6-7890-1234-567890abcdef")
 * )
 */
class carritoController extends BaseController // O simplemente extends Controller, según tu setup
{
    /**
     * @OA\Get(
     * path="/api/carrito",
     * summary="Obtener el carrito del cliente autenticado o del invitado.",
     * tags={"Carrito de Compras"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="X-Guest-ID",
     * in="header",
     * required=false,
     * description="ID del usuario invitado (UUID) si no hay autenticación de usuario. Requerido si no hay token de autenticación.",
     * @OA\Schema(type="string", format="uuid")
     * ),
     * @OA\Response(
     * response=200,
     * description="Carrito obtenido exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Cart retrieved successfully."),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/CartItemWithProduct")
     * )
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado: Se requiere autenticación o ID de invitado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
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
     * @OA\Post(
     * path="/api/carrito",
     * summary="Agregar un producto al carrito o actualizar su cantidad.",
     * description="Añade un nuevo producto al carrito o incrementa la cantidad de uno existente. Funciona para clientes autenticados o invitados (usando 'X-Guest-ID').",
     * tags={"Carrito de Compras"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="X-Guest-ID",
     * in="header",
     * required=false,
     * description="ID del usuario invitado (UUID) si no hay autenticación de usuario. Requerido si no hay token de autenticación.",
     * @OA\Schema(type="string", format="uuid")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos del producto a añadir o actualizar en el carrito.",
     * @OA\JsonContent(ref="#/components/schemas/AddToCartInput")
     * ),
     * @OA\Response(
     * response=200,
     * description="Producto añadido/actualizado en el carrito exitosamente.",
     * @OA\JsonContent(ref="#/components/schemas/CartItemWithProduct")
     * ),
     * @OA\Response(
     * response=400,
     * description="Producto no disponible o no existe.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado: Se requiere autenticación o ID de invitado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=422,
     * description="Errores de validación.",
     * @OA\JsonContent(ref="#/components/schemas/ValidationError")
     * )
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
     * @OA\Patch(
     * path="/api/carrito/{idCarrito}",
     * summary="Actualizar la cantidad de un producto específico en el carrito.",
     * description="Actualiza la cantidad de un ítem existente en el carrito. Si la cantidad es 0 o menos, el ítem se eliminará. Funciona para clientes autenticados o invitados.",
     * tags={"Carrito de Compras"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="idCarrito",
     * in="path",
     * required=true,
     * description="ID del ítem del carrito a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Parameter(
     * name="X-Guest-ID",
     * in="header",
     * required=false,
     * description="ID del usuario invitado (UUID) si no hay autenticación de usuario. Requerido si no hay token de autenticación.",
     * @OA\Schema(type="string", format="uuid")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Nueva cantidad del producto en el carrito.",
     * @OA\JsonContent(ref="#/components/schemas/UpdateCartItemInput")
     * ),
     * @OA\Response(
     * response=200,
     * description="Cantidad del producto actualizada exitosamente o producto eliminado.",
     * @OA\JsonContent(
     * type="object",
     * oneOf={
     * @OA\Schema(ref="#/components/schemas/CartItemWithProduct"),
     * @OA\Schema(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Product removed from cart successfully."),
     * @OA\Property(property="data", type="object", properties={
     * @OA\Property(property="idCarrito", type="integer", example=1),
     * @OA\Property(property="removed", type="boolean", example=true)
     * })
     * )
     * }
     * )
     * ),
     * @OA\Response(
     * response=400,
     * description="Errores en la cantidad proporcionada.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado: Se requiere autenticación o ID de invitado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=404,
     * description="Ítem del carrito no encontrado o no pertenece al cliente/invitado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=422,
     * description="Errores de validación.",
     * @OA\JsonContent(ref="#/components/schemas/ValidationError")
     * )
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
     * @OA\Delete(
     * path="/api/carrito/{idCarrito}",
     * summary="Eliminar un producto específico del carrito.",
     * description="Elimina un ítem del carrito por su ID. Funciona para clientes autenticados o invitados.",
     * tags={"Carrito de Compras"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="idCarrito",
     * in="path",
     * required=true,
     * description="ID del ítem del carrito a eliminar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Parameter(
     * name="X-Guest-ID",
     * in="header",
     * required=false,
     * description="ID del usuario invitado (UUID) si no hay autenticación de usuario. Requerido si no hay token de autenticación.",
     * @OA\Schema(type="string", format="uuid")
     * ),
     * @OA\Response(
     * response=200,
     * description="Producto eliminado del carrito exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Product removed from cart successfully."),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(type="object"),
     * example={}
     * )
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado: Se requiere autenticación o ID de invitado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=404,
     * description="Ítem del carrito no encontrado o no pertenece al cliente/invitado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
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
     * @OA\Delete(
     * path="/api/carrito/vaciar",
     * summary="Vaciar completamente el carrito del cliente autenticado o del invitado.",
     * description="Elimina todos los ítems del carrito para el cliente autenticado o el invitado (usando 'X-Guest-ID').",
     * tags={"Carrito de Compras"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="X-Guest-ID",
     * in="header",
     * required=false,
     * description="ID del usuario invitado (UUID) si no hay autenticación de usuario. Requerido si no hay token de autenticación.",
     * @OA\Schema(type="string", format="uuid")
     * ),
     * @OA\Response(
     * response=200,
     * description="Carrito vaciado exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Cart cleared successfully."),
     * @OA\Property(property="data", type="array",
     * * @OA\Items(type="object"), example={})
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado: Se requiere autenticación o ID de invitado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
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
     * @OA\Post(
     * path="/api/carrito/fusionar",
     * summary="Fusionar el carrito de invitado con el carrito del cliente al iniciar sesión.",
     * description="Este endpoint debe ser llamado después de que un usuario invitado se autentica. Mueve los ítems del carrito asociados al 'guest_id' a la cuenta del cliente autenticado, fusionando cantidades si los productos ya existen en el carrito del cliente.",
     * tags={"Carrito de Compras"},
     * security={{"bearerAuth": {}}},
     * @OA\RequestBody(
     * required=true,
     * description="ID del usuario invitado cuyo carrito se va a fusionar.",
     * @OA\JsonContent(ref="#/components/schemas/MergeGuestCartInput")
     * ),
     * @OA\Response(
     * response=200,
     * description="Carrito de invitado fusionado exitosamente. Devuelve el carrito actualizado del usuario.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Guest cart merged successfully."),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/CartItemWithProduct")
     * )
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado: El usuario debe estar autenticado para fusionar carritos.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=404,
     * description="Perfil de cliente no encontrado para el usuario autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=422,
     * description="Errores de validación (ej. formato de guest_id inválido).",
     * @OA\JsonContent(ref="#/components/schemas/ValidationError")
     * )
     * )
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
