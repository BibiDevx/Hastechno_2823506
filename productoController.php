<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Http\Controllers\BaseController;

class productoController extends BaseController
{
    public function home()
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto')
            ->where('disponibilidad', 1)
            ->latest()
            ->take(9)
            ->get();

        return $this->sendResponse($productos, 'Productos más recientes obtenidos correctamente');
    }
    
    public function detalles()
{
    ///Admin solo ve el de detalles ya que son todos los productos con su categoria y marca y proveedor (solo id y nombre)
    $productos = Producto::with(['marca', 'categorias', 'proveedor:idProveedor,nombreProveedor'])->get();
    return $this->sendResponse($productos, 'Detalles de productos obtenidos correctamente');
}

    public function index()
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto')
            ->with(['categorias'])
            ->where('disponibilidad', 1)
            ->get();

        return $this->sendResponse($productos, 'Lista de productos disponibles');
    }
    public function productosPorMarca($idMarca)
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto')
            ->where('idMarca', $idMarca)->get();
        return $this->sendResponse($productos, 'Productos por marca obtenidos correctamente');
    }

    public function show($id)
    {
        $producto = Producto::with(['marca', 'categorias'])
            ->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'idMarca')
            ->find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

        return $this->sendResponse($producto, 'Producto obtenido correctamente');
    }

    public function store(Request $request)
    {
        // Validación de los campos de entrada
        $request->validate([
            'nombreProducto' => 'required|string|max:255',
            'definicion' => 'required|string', // Aseguramos que se pase 'definicion'
            'valorProducto' => 'required|numeric',
            'disponibilidad' => 'required|boolean',
            'idMarca' => 'required|exists:marca,idMarca',
            'idProveedor' => 'required|exists:proveedor,idProveedor',
        ]);
    
        // Creamos el nuevo producto asegurándonos de que 'definicion' nunca sea nulo
        $producto = Producto::create([
            'nombreProducto' => $request->nombreProducto,
            'definicion' => $request->definicion ?: '', // Si 'definicion' es vacío o null, asigna una cadena vacía
            'valorProducto' => $request->valorProducto,
            'disponibilidad' => $request->disponibilidad,
            'idMarca' => $request->idMarca,
            'idProveedor' => $request->idProveedor,
        ]);

        $producto->load([
            'marca:idMarca,nombreMarca', // Carga solo idMarca y nombreMarca para la relación marca
            'proveedor:idProveedor,nombreProveedor' // Carga solo idProveedor y nombreProveedor para la relación proveedor
        ]);
    
        // Retornamos una respuesta con el producto creado
        return response()->json($producto, 201);
    }


    public function updatePartial(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

        $request->validate([
            'nombreProducto' => 'sometimes|string|max:255',
            'definicion' => 'sometimes|nullable|string',
            'valorProducto' => 'sometimes|numeric',
            'disponibilidad' => 'sometimes|boolean',
            'idMarca' => 'sometimes|exists:marca,idMarca',
            'idProveedor' => 'sometimes|exists:proveedor,idProveedor',
            'categorias' => 'sometimes|array',
            'categorias.*' => 'exists:categoria,idCategoria'
        ]);

        $producto->fill($request->only([
            'nombreProducto',
            'definicion',
            'valorProducto',
            'disponibilidad',
            'idMarca',
            'idProveedor'
        ]));

        $producto->save();

        if ($request->has('categorias')) {
            $producto->categorias()->sync($request->categorias);
        }

        return $this->sendResponse($producto->load(['marca', 'categorias']), 'Producto actualizado correctamente');
    }

    public function destroy($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

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

        // Carga solo las columnas específicas y cualifica 'idCategoria'
        // Especifica 'categoria.idCategoria' para evitar ambigüedad.
        $categorias = $producto->categorias()->select('categoria.idCategoria', 'nombreCategoria')->get();
        // Opcionalmente, puedes eliminar el select para que Eloquent lo maneje por defecto si sus convenciones son suficientes.
        // Pero si quieres seleccionar solo estas columnas, la cualificación es clave.

        return $this->sendResponse($categorias, 'Categorías del producto obtenidas correctamente.');
    }

    /**
     * Sincroniza las categorías para un producto específico.
     * PATCH /api/productos/{id}/categorias
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id  ID del producto
     * @return \Illuminate\Http\JsonResponse
     */
    public function syncProductCategories(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

        $request->validate([
            'categorias' => 'sometimes|array',
            'categorias.*' => 'exists:categoria,idCategoria',
        ]);

        if ($request->has('categorias')) {
            $producto->categorias()->sync($request->categorias);
        }

        // Carga las relaciones de categorías para la respuesta
        // Aquí también es buena práctica cualificar si vas a seleccionar campos específicos
        $producto->load(['categorias:categoria.idCategoria,nombreCategoria']);

        return $this->sendResponse($producto, 'Categorías del producto actualizadas correctamente.');
    }
}
