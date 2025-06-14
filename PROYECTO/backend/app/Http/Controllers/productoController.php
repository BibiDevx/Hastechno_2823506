<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Http\Controllers\BaseController; // Asegúrate de que BaseController esté disponible

class productoController extends BaseController
{
    /**
     * Obtiene los productos más recientes y disponibles para la página de inicio.
     * Incluye 'disponibilidad' en la selección.
     * GET /api/home-products
     */
    public function home()
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad') // <--- AÑADIDO 'disponibilidad'
            ->where('disponibilidad', 1) // Filtra por productos disponibles
            ->latest() // Ordena por los más recientes
            ->take(9) // Toma los primeros 9
            ->get();

        return $this->sendResponse($productos, 'Productos más recientes obtenidos correctamente');
    }
    
    /**
     * Obtiene todos los productos con detalles de marca, categorías y proveedor para la administración.
     * Incluye 'disponibilidad' en la selección base.
     * GET /api/admin/productos/detalles (o similar)
     */
    public function detalles()
    {
        // Admin solo ve el de detalles ya que son todos los productos con su categoria y marca y proveedor (solo id y nombre)
        // Por defecto, get() selecciona todas las columnas si no hay select explícito.
        // Pero si tuvieras un select aquí, deberías incluir 'disponibilidad'.
        $productos = Producto::with([
            'marca', 
            'categorias', 
            'proveedor:idProveedor,nombreProveedor'
        ])->get(); 
        // Si no se especifica select(), todas las columnas del producto (incluyendo 'disponibilidad') se seleccionan por defecto.
        // Si tuvieras un select aquí, añadirías 'disponibilidad' explícitamente.

        return $this->sendResponse($productos, 'Detalles de productos obtenidos correctamente');
    }

    /**
     * Obtiene todos los productos disponibles para el listado general (clientes).
     * Incluye 'disponibilidad' en la selección.
     * GET /api/products (o similar)
     */
    public function index()
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad') // <--- AÑADIDO 'disponibilidad'
            ->with(['categorias']) // Carga la relación de categorías
            ->where('disponibilidad', 1) // Filtra por productos disponibles
            ->get();

        return $this->sendResponse($productos, 'Lista de productos disponibles');
    }

    /**
     * Obtiene productos filtrados por una marca específica.
     * Incluye 'disponibilidad' en la selección.
     * GET /api/productos-por-marca/{idMarca}
     */
    public function productosPorMarca($idMarca)
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad') // <--- AÑADIDO 'disponibilidad'
            ->where('idMarca', $idMarca)
            ->get();
        return $this->sendResponse($productos, 'Productos por marca obtenidos correctamente');
    }

    /**
     * Obtiene los detalles de un producto específico por su ID.
     * Incluye 'disponibilidad' en la selección.
     * GET /api/productos/{id}
     */
    public function show($id)
    {
        $producto = Producto::with(['marca', 'categorias'])
            ->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'idMarca', 'disponibilidad') // <--- AÑADIDO 'disponibilidad'
            ->find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

        return $this->sendResponse($producto, 'Producto obtenido correctamente');
    }

    /**
     * Almacena un nuevo producto.
     * POST /api/productos
     */
    public function store(Request $request)
    {
        // Usar Validator para mayor flexibilidad en los mensajes de error
        $validator = Validator::make($request->all(), [
            'nombreProducto' => 'required|string|max:255',
            'definicion' => 'required|string', 
            'valorProducto' => 'required|numeric',
            'disponibilidad' => 'required|boolean', // Valida que sea un booleano
            'idMarca' => 'required|exists:marca,idMarca',
            'idProveedor' => 'required|exists:proveedor,idProveedor',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }
    
        $producto = Producto::create([
            'nombreProducto' => $request->nombreProducto,
            'definicion' => $request->definicion, 
            'valorProducto' => $request->valorProducto,
            'disponibilidad' => $request->disponibilidad,
            'idMarca' => $request->idMarca,
            'idProveedor' => $request->idProveedor,
        ]);

        // Carga las relaciones para la respuesta
        $producto->load([
            'marca:idMarca,nombreMarca', 
            'proveedor:idProveedor,nombreProveedor' 
        ]);
    
        // Utiliza sendResponse para consistencia con tu BaseController
        return $this->sendResponse($producto, 'Producto creado correctamente');
    }

    /**
     * Actualiza parcialmente un producto existente.
     * PATCH /api/productos/{id}
     */
    public function updatePartial(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

        // Usar Validator para mayor flexibilidad en los mensajes de error
        $validator = Validator::make($request->all(), [
            'nombreProducto' => 'sometimes|string|max:255',
            'definicion' => 'sometimes|nullable|string',
            'valorProducto' => 'sometimes|numeric',
            'disponibilidad' => 'sometimes|boolean', // Valida que sea un booleano
            'idMarca' => 'sometimes|exists:marca,idMarca',
            'idProveedor' => 'sometimes|exists:proveedor,idProveedor',
            'categorias' => 'sometimes|array',
            'categorias.*' => 'exists:categoria,idCategoria'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $producto->fill($request->only([
            'nombreProducto',
            'definicion',
            'valorProducto',
            'disponibilidad', // Asegúrate de incluirlo aquí
            'idMarca',
            'idProveedor'
        ]));

        $producto->save();

        if ($request->has('categorias')) {
            $producto->categorias()->sync($request->categorias);
        }

        // Carga las relaciones para la respuesta (incluyendo categorias para el frontend)
        return $this->sendResponse($producto->load(['marca', 'categorias']), 'Producto actualizado correctamente');
    }

    /**
     * Elimina un producto.
     * DELETE /api/productos/{id}
     */
    public function destroy($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

        // Considera añadir lógica para verificar si el producto está en carritos activos o pedidos antes de eliminar.
        // Si tienes una relación de productos a carritos, podrías hacer:
        // if ($producto->carritos()->count() > 0) {
        //     return $this->sendError('No se puede eliminar el producto porque está en carritos o pedidos activos.', [], 409);
        // }

        $producto->delete();

        return $this->sendResponse([], 'Producto eliminado correctamente');
    }

    /**
     * Obtiene las categorías asociadas a un producto específico.
     * GET /api/productos/{id}/categorias
     */
    public function getProductCategories($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

        // Carga solo las columnas específicas de la tabla pivote y de la tabla de categorías
        // La cualificación `categoria.idCategoria` es importante si hay ambigüedad
        $categorias = $producto->categorias()->select('categoria.idCategoria', 'nombreCategoria')->get();

        return $this->sendResponse($categorias, 'Categorías del producto obtenidas correctamente.');
    }

    public function syncProductCategories(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

        // Validar que 'categorias' sea un array y que sus IDs existan
        $validator = Validator::make($request->all(), [
            'categorias' => 'sometimes|array',
            'categorias.*' => 'exists:categoria,idCategoria',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        if ($request->has('categorias')) {
            $producto->categorias()->sync($request->categorias);
        }

        // Carga las relaciones de categorías para la respuesta
        $producto->load(['categorias:categoria.idCategoria,nombreCategoria']);

        return $this->sendResponse($producto, 'Categorías del producto actualizadas correctamente.');
    }
}
