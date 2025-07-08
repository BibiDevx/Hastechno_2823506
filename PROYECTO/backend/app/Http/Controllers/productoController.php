<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 *     name="Productos",
 *     description="Gestión de productos para clientes y administración"
 * )
 */
class productoController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/home-products",
     *     summary="Obtener productos más recientes para la página de inicio",
     *     tags={"Productos"},
     *     @OA\Response(response=200, description="Productos más recientes obtenidos correctamente")
     * )
     */
    public function home()
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad', 'cantidadStock')
            ->where('disponibilidad', 1)
            ->where('cantidadStock', '>', 0)
            ->latest()
            ->take(9)
            ->get();

        return $this->sendResponse($productos, 'Productos más recientes obtenidos correctamente');
    }

    /**
     * @OA\Get(
     *     path="/api/admin/productos/detalles",
     *     summary="Obtener detalles completos de productos (admin)",
     *     tags={"Productos"},
     *     @OA\Response(response=200, description="Detalles de productos obtenidos correctamente")
     * )
     */
    public function detalles()
    {
        $productos = Producto::with(['marca', 'categorias', 'proveedor:idProveedor,nombreProveedor'])->get();
        return $this->sendResponse($productos, 'Detalles de productos obtenidos correctamente');
    }

    /**
     * @OA\Get(
     *     path="/api/products",
     *     summary="Obtener productos disponibles para clientes",
     *     tags={"Productos"},
     *     @OA\Response(response=200, description="Lista de productos disponibles")
     * )
     */
    public function index()
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad', 'cantidadStock')
            ->with(['categorias'])
            ->where('disponibilidad', 1)
            ->where('cantidadStock', '>', 0)
            ->get();

        return $this->sendResponse($productos, 'Lista de productos disponibles');
    }

    /**
     * @OA\Get(
     *     path="/api/productos-por-marca/{idMarca}",
     *     summary="Obtener productos filtrados por marca",
     *     tags={"Productos"},
     *     @OA\Parameter(
     *         name="idMarca",
     *         in="path",
     *         required=true,
     *         description="ID de la marca",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Productos por marca obtenidos correctamente")
     * )
     */
    public function productosPorMarca($idMarca)
    {
        $productos = Producto::select('idProducto', 'nombreProducto', 'valorProducto', 'disponibilidad', 'cantidadStock', 'idMarca')
            ->with('marca:idMarca,nombreMarca')
            ->where('idMarca', $idMarca)
            ->get();

        return $this->sendResponse($productos, 'Productos por marca obtenidos correctamente');
    }

    /**
     * @OA\Get(
     *     path="/api/productos/{id}",
     *     summary="Obtener un producto por ID",
     *     tags={"Productos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del producto",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Producto obtenido correctamente"),
     *     @OA\Response(response=404, description="Producto no encontrado")
     * )
     */
    public function show($id)
    {
        $producto = Producto::with(['marca', 'categorias'])
            ->select('idProducto', 'nombreProducto', 'valorProducto', 'definicion', 'idMarca', 'disponibilidad', 'cantidadStock')
            ->find($id);

        if (!$producto) {
            return $this->sendError('Producto no encontrado');
        }

        return $this->sendResponse($producto, 'Producto obtenido correctamente');
    }

    /**
     * @OA\Post(
     *     path="/api/productos",
     *     summary="Crear un nuevo producto",
     *     tags={"Productos"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombreProducto", "definicion", "valorProducto", "cantidadStock", "idMarca", "idProveedor"},
     *             @OA\Property(property="nombreProducto", type="string", example="Camiseta"),
     *             @OA\Property(property="definicion", type="string", example="Camiseta deportiva"),
     *             @OA\Property(property="valorProducto", type="number", example=59.99),
     *             @OA\Property(property="cantidadStock", type="integer", example=10),
     *             @OA\Property(property="idMarca", type="integer", example=1),
     *             @OA\Property(property="idProveedor", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Producto creado correctamente"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombreProducto' => 'required|string|max:255',
            'definicion' => 'required|string',
            'valorProducto' => 'required|numeric|min:0',
            'cantidadStock' => 'required|integer|min:0',
            'idMarca' => 'required|exists:marca,idMarca',
            'idProveedor' => 'required|exists:proveedor,idProveedor',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $data = $request->all();
        $data['disponibilidad'] = ($data['cantidadStock'] > 0) ? 1 : 0;

        $producto = Producto::create($data);
        $producto->load(['marca:idMarca,nombreMarca', 'proveedor:idProveedor,nombreProveedor', 'categorias']);

        return $this->sendResponse($producto, 'Producto creado correctamente');
    }

    /**
     * @OA\Patch(
     *     path="/api/productos/{id}",
     *     summary="Actualizar parcialmente un producto",
     *     tags={"Productos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del producto a actualizar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="nombreProducto", type="string"),
     *             @OA\Property(property="valorProducto", type="number"),
     *             @OA\Property(property="cantidadStock", type="integer"),
     *             @OA\Property(property="idMarca", type="integer"),
     *             @OA\Property(property="idProveedor", type="integer"),
     *             @OA\Property(property="categorias", type="array", @OA\Items(type="integer"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Producto actualizado correctamente"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
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
            'cantidadStock' => 'sometimes|integer|min:0',
            'idMarca' => 'sometimes|exists:marca,idMarca',
            'idProveedor' => 'sometimes|exists:proveedor,idProveedor',
            'categorias' => 'sometimes|array',
            'categorias.*' => 'exists:categoria,idCategoria'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $data = $request->only([
            'nombreProducto', 'definicion', 'valorProducto',
            'cantidadStock', 'idMarca', 'idProveedor'
        ]);

        if (isset($data['cantidadStock'])) {
            $data['disponibilidad'] = ($data['cantidadStock'] > 0) ? 1 : 0;
        }

        $producto->fill($data)->save();

        if ($request->has('categorias')) {
            $producto->categorias()->sync($request->categorias);
        }

        return $this->sendResponse($producto->load(['marca', 'categorias', 'proveedor']), 'Producto actualizado correctamente');
    }

    /**
     * @OA\Delete(
     *     path="/api/productos/{id}",
     *     summary="Eliminar un producto",
     *     tags={"Productos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del producto a eliminar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Producto eliminado correctamente"),
     *     @OA\Response(response=404, description="Producto no encontrado")
     * )
     */
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
     * @OA\Get(
     *     path="/api/productos/{id}/categorias",
     *     summary="Obtener categorías de un producto",
     *     tags={"Productos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del producto",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Categorías del producto obtenidas correctamente")
     * )
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
     * @OA\Post(
     *     path="/api/productos/{id}/categorias",
     *     summary="Sincronizar categorías de un producto",
     *     tags={"Productos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del producto",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="categorias",
     *                 type="array",
     *                 @OA\Items(type="integer")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Categorías del producto actualizadas correctamente"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
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

    /**
     * @OA\Get(
     *     path="/api/productos/stock-bajo",
     *     summary="Obtener productos con stock bajo",
     *     tags={"Productos"},
     *     @OA\Response(response=200, description="Productos con stock bajo obtenidos correctamente"),
     *     @OA\Response(response=500, description="Error al obtener productos con stock bajo")
     * )
     */
    public function getProductosBajoStock()
    {
        Log::info('ProductoController@getProductosBajoStock - Solicitud de productos con stock bajo.');
        try {
            $umbralStockBajo = 10;
            $productosBajoStock = Producto::with(['marca:idMarca,nombreMarca', 'proveedor:idProveedor,nombreProveedor'])
                                          ->where('cantidadStock', '<=', $umbralStockBajo)
                                          ->get();

            return $this->sendResponse($productosBajoStock, 'Productos con stock bajo obtenidos correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al obtener productos con stock bajo:', ['error' => $e->getMessage()]);
            return $this->sendError('Error al obtener productos con stock bajo.', [], 500);
        }
    }
}
