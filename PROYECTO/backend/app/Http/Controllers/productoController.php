<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Http\Controllers\BaseController; // Asegúrate de que BaseController esté disponible
use Illuminate\Support\Facades\Validator; // Necesario para Validator

class productoController extends BaseController
{
    /**
     * Obtiene los productos más recientes y disponibles para la página de inicio.
     * GET /api/home-products
     */
    public function home()
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad', 'cantidadStock') // ✅ Añadido 'cantidadStock'
            ->where('disponibilidad', 1) // Filtra por productos marcados como disponibles
            ->where('cantidadStock', '>', 0) // ✅ Y que realmente tengan stock > 0
            ->latest() // Ordena por los más recientes
            ->take(9) // Toma los primeros 9
            ->get();

        return $this->sendResponse($productos, 'Productos más recientes obtenidos correctamente');
    }
    
    /**
     * Obtiene todos los productos con detalles de marca, categorías y proveedor para la administración.
     * GET /api/admin/productos/detalles (o similar)
     */
    public function detalles()
    {
        // Admin solo ve el de detalles ya que son todos los productos con su categoria y marca y proveedor (solo id y nombre)
        // Por defecto, get() selecciona todas las columnas si no hay select explícito.
        // Por lo tanto, 'cantidadStock' debería estar incluido aquí automáticamente.
        $productos = Producto::with([
            'marca', 
            'categorias', 
            'proveedor:idProveedor,nombreProveedor'
        ])->get(); 
        
        // Si en algún momento necesitas un select explícito aquí, asegúrate de incluir 'cantidadStock':
        // ->select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad', 'cantidadStock', 'definicion', 'idMarca', 'idProveedor')

        return $this->sendResponse($productos, 'Detalles de productos obtenidos correctamente');
    }

    /**
     * Obtiene todos los productos disponibles para el listado general (clientes).
     * GET /api/products (o similar)
     */
    public function index()
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad', 'cantidadStock') // ✅ Añadido 'cantidadStock'
            ->with(['categorias']) // Carga la relación de categorías
            ->where('disponibilidad', 1) // Filtra por productos marcados como disponibles
            ->where('cantidadStock', '>', 0) // ✅ Y que realmente tengan stock > 0
            ->get();

        return $this->sendResponse($productos, 'Lista de productos disponibles');
    }

    /**
     * Obtiene productos filtrados por una marca específica.
     * GET /api/productos-por-marca/{idMarca}
     */
    public function productosPorMarca($idMarca)
    {
        // También cargamos la relación 'marca' aquí para obtener el 'nombreMarca' en el frontend
        // y poder mostrarlo en el título de la página.
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad', 'cantidadStock', 'idMarca') // ✅ Añadido 'cantidadStock' y 'idMarca'
            ->with('marca:idMarca,nombreMarca') // ✅ Cargar la marca para obtener el nombre
            ->where('idMarca', $idMarca)
            ->get();
        return $this->sendResponse($productos, 'Productos por marca obtenidos correctamente');
    }

    /**
     * Obtiene los detalles de un producto específico por su ID.
     * GET /api/productos/{id}
     */
    public function show($id)
    {
        $producto = Producto::with(['marca', 'categorias'])
            ->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'idMarca', 'disponibilidad', 'cantidadStock') // ✅ Añadido 'cantidadStock'
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
        $validator = Validator::make($request->all(), [
            'nombreProducto' => 'required|string|max:255',
            'definicion' => 'required|string', 
            'valorProducto' => 'required|numeric|min:0', // Valor no negativo
            'cantidadStock' => 'required|integer|min:0', // ✅ Nuevo: 'cantidadStock' es requerido
            // 'disponibilidad' ya no es requerido en el request, se deriva del stock
            'idMarca' => 'required|exists:marca,idMarca',
            'idProveedor' => 'required|exists:proveedor,idProveedor',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }
    
        $data = $request->all();
        // ✅ Derivar 'disponibilidad' de 'cantidadStock'
        $data['disponibilidad'] = ($data['cantidadStock'] > 0) ? 1 : 0;

        $producto = Producto::create($data); // Crea el producto con todos los datos validados y derivados

        // Carga las relaciones para la respuesta
        $producto->load([
            'marca:idMarca,nombreMarca', 
            'proveedor:idProveedor,nombreProveedor',
            'categorias' // Si las categorías se asocian en la creación y quieres verlas
        ]);
    
        return $this->sendResponse($producto, 'Producto creado correctamente', 201); // 201 Created
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

        $validator = Validator::make($request->all(), [
            'nombreProducto' => 'sometimes|string|max:255',
            'definicion' => 'sometimes|nullable|string',
            'valorProducto' => 'sometimes|numeric|min:0',
            'cantidadStock' => 'sometimes|integer|min:0', // ✅ Nuevo: 'cantidadStock' opcional en la actualización
            // 'disponibilidad' ya no es un campo de entrada directo
            'idMarca' => 'sometimes|exists:marca,idMarca',
            'idProveedor' => 'sometimes|exists:proveedor,idProveedor',
            'categorias' => 'sometimes|array',
            'categorias.*' => 'exists:categoria,idCategoria'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $data = $request->only([
            'nombreProducto',
            'definicion',
            'valorProducto',
            'cantidadStock', // ✅ Incluir 'cantidadStock' en los datos a llenar
            'idMarca',
            'idProveedor'
        ]);

        // ✅ Si 'cantidadStock' está presente en el request, recalcular 'disponibilidad'
        if (isset($data['cantidadStock'])) {
            $data['disponibilidad'] = ($data['cantidadStock'] > 0) ? 1 : 0;
        }

        $producto->fill($data);
        $producto->save();

        if ($request->has('categorias')) {
            $producto->categorias()->sync($request->categorias);
        }

        // Carga las relaciones para la respuesta
        return $this->sendResponse($producto->load(['marca', 'categorias', 'proveedor']), 'Producto actualizado correctamente');
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

        // Se recomienda añadir lógica para verificar si el producto está en carritos activos o pedidos antes de eliminar.
        // Ejemplo:
        // if ($producto->pedidos()->exists() || $producto->carritos()->exists()) {
        //     return $this->sendError('No se puede eliminar el producto porque está asociado a pedidos o carritos.', [], 409);
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

        $categorias = $producto->categorias()->select('categoria.idCategoria', 'nombreCategoria')->get();

        return $this->sendResponse($categorias, 'Categorías del producto obtenidas correctamente.');
    }

    /**
     * Sincroniza las categorías de un producto.
     * PUT/POST /api/productos/{id}/categorias
     */
    public function syncProductCategories(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

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

        $producto->load(['categorias:categoria.idCategoria,nombreCategoria']);

        return $this->sendResponse($producto, 'Categorías del producto actualizadas correctamente.');
    }
}
