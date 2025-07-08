<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator; 
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 * name="Productos",
 * description="Operaciones relacionadas con la gestión de productos."
 * )
 *
 * @OA\Schema(
 * schema="ProductoHome",
 * title="Producto para Página de Inicio",
 * description="Representación simplificada de un producto para la página de inicio.",
 * @OA\Property(property="idProducto", type="integer", format="int64", description="ID único del producto.", example=1),
 * @OA\Property(property="nombreProducto", type="string", description="Nombre del producto.", example="Teclado Mecánico"),
 * @OA\Property(property="valorProducto", type="number", format="float", description="Precio del producto.", example=75.99),
 * @OA\Property(property="disponibilidad", type="boolean", description="Indica si el producto está disponible.", example=true),
 * @OA\Property(property="cantidadStock", type="integer", description="Cantidad de unidades en stock.", example=20)
 * )
 *
 * @OA\Schema(
 * schema="ProductoIndex",
 * title="Producto para Listado General",
 * description="Representación de un producto para el listado general, incluyendo categorías.",
 * allOf={
 * @OA\Schema(ref="#/components/schemas/ProductoHome"),
 * @OA\Schema(
 * @OA\Property(
 * property="categorias",
 * type="array",
 * @OA\Items(ref="#/components/schemas/Categoria"),
 * description="Lista de categorías asociadas al producto."
 * )
 * )
 * }
 * )
 *
 * @OA\Schema(
 * schema="ProductoDetalle",
 * title="Detalle de Producto",
 * description="Representación completa de un producto con todas sus relaciones cargadas.",
 * allOf={
 * @OA\Schema(ref="#/components/schemas/Producto"),
 * @OA\Schema(
 * @OA\Property(
 * property="marca",
 * ref="#/components/schemas/Marca",
 * description="Objeto de la marca asociada al producto."
 * ),
 * @OA\Property(
 * property="categorias",
 * type="array",
 * @OA\Items(ref="#/components/schemas/Categoria"),
 * description="Lista de categorías asociadas al producto."
 * ),
 * @OA\Property(
 * property="proveedor",
 * ref="#/components/schemas/ProveedorBasic",
 * description="Información básica del proveedor asociado al producto."
 * )
 * )
 * }
 * )
 *
 * @OA\Schema(
 * schema="ProductoUpdateInput",
 * title="Entrada de Actualización de Producto",
 * description="Campos opcionales para actualizar un producto.",
 * @OA\Property(property="nombreProducto", type="string", maxLength=255, description="Nuevo nombre del producto."),
 * @OA\Property(property="definicion", type="string", nullable=true, description="Nueva descripción detallada del producto."),
 * @OA\Property(property="valorProducto", type="number", format="float", minLength=0, description="Nuevo precio del producto."),
 * @OA\Property(property="cantidadStock", type="integer", minLength=0, description="Nueva cantidad de unidades en stock."),
 * @OA\Property(property="idMarca", type="integer", format="int64", description="Nuevo ID de la marca."),
 * @OA\Property(property="idProveedor", type="integer", format="int64", description="Nuevo ID del proveedor."),
 * @OA\Property(
 * property="categorias",
 * type="array",
 * @OA\Items(type="integer", format="int64"),
 * description="Array de IDs de categorías para sincronizar con el producto."
 * )
 * )
 */
class productoController extends BaseController
{
    /**
     * @OA\Get(
     * path="/api/verProductos/home",
     * summary="Obtiene los productos más recientes y disponibles para la página de inicio.",
     * tags={"Productos"},
     * @OA\Response(
     * response=200,
     * description="Productos más recientes obtenidos correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Productos más recientes obtenidos correctamente"),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/ProductoHome")
     * )
     * )
     * )
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
     * path="/api/productos/detalles",
     * summary="Obtiene todos los productos con detalles de marca, categorías y proveedor para la administración.",
     * tags={"Productos"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Detalles de productos obtenidos correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Detalles de productos obtenidos correctamente"),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/ProductoDetalle")
     * )
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function detalles()
    {
        $productos = Producto::with([
            'marca', 
            'categorias', 
            'proveedor:idProveedor,nombreProveedor'
        ])->get(); 
        
        return $this->sendResponse($productos, 'Detalles de productos obtenidos correctamente');
    }

    /**
     * @OA\Get(
     * path="/api/verProductos/",
     * summary="Obtiene todos los productos disponibles para el listado general (clientes).",
     * tags={"Productos"},
     * @OA\Response(
     * response=200,
     * description="Lista de productos disponibles.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Lista de productos disponibles"),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/ProductoIndex")
     * )
     * )
     * )
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
     * path="/api/verProductos/marcas/{idMarca}",
     * summary="Obtiene productos filtrados por una marca específica.",
     * tags={"Productos"},
     * @OA\Parameter(
     * name="idMarca",
     * in="path",
     * required=true,
     * description="ID de la marca para filtrar productos.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Productos por marca obtenidos correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Productos por marca obtenidos correctamente"),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(
     * type="object",
     * ref="#/components/schemas/ProductoHome",
     * @OA\Property(property="idMarca", type="integer", format="int64", description="ID de la marca del producto.", example=1),
     * @OA\Property(property="marca", ref="#/components/schemas/Marca", description="Objeto de la marca asociada al producto.")
     * )
     * )
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Marca no encontrada (aunque el controlador no lo maneje explícitamente, es una posible respuesta lógica).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
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
     * path="/api/verProductos/{id}",
     * summary="Obtiene los detalles de un producto específico por su ID.",
     * tags={"Productos"},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del producto a obtener.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Producto obtenido correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Producto obtenido correctamente"),
     * @OA\Property(
     * property="data",
     * type="object",
     * allOf={
     * @OA\Schema(ref="#/components/schemas/ProductoHome"),
     * @OA\Schema(
     * @OA\Property(property="definicion", type="string", description="Descripción detallada del producto.", example="Laptop de alto rendimiento..."),
     * @OA\Property(property="idMarca", type="integer", format="int64", description="ID de la marca del producto.", example=1),
     * @OA\Property(property="marca", ref="#/components/schemas/Marca", description="Objeto de la marca asociada al producto."),
     * @OA\Property(
     * property="categorias",
     * type="array",
     * @OA\Items(ref="#/components/schemas/Categoria"),
     * description="Lista de categorías asociadas al producto."
     * )
     * )
     * }
     * )
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Producto no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
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
     * path="/api/productos/registrar",
     * summary="Almacena un nuevo producto.",
     * tags={"Productos"},
     * security={{"bearerAuth": {}}},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para crear un nuevo producto.",
     * @OA\JsonContent(
     * required={"nombreProducto", "definicion", "valorProducto", "cantidadStock", "idMarca", "idProveedor"},
     * @OA\Property(property="nombreProducto", type="string", maxLength=255, description="Nombre del producto.", example="Nuevo Smartphone"),
     * @OA\Property(property="definicion", type="string", description="Descripción detallada del producto.", example="Un smartphone de última generación con cámara de 108MP."),
     * @OA\Property(property="valorProducto", type="number", format="float", minLength=0, description="Precio del producto.", example=899.99),
     * @OA\Property(property="cantidadStock", type="integer", minLength=0, description="Cantidad de unidades en stock.", example=100),
     * @OA\Property(property="idMarca", type="integer", format="int64", description="ID de la marca del producto.", example=1),
     * @OA\Property(property="idProveedor", type="integer", format="int64", description="ID del proveedor del producto.", example=1)
     * )
     * ),
     * @OA\Response(
     * response=201,
     * description="Producto creado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Producto creado correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/ProductoDetalle")
     * )
     * ),
     * @OA\Response(
     * response=422,
     * description="Errores de validación.",
     * @OA\JsonContent(ref="#/components/schemas/ValidationError")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
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

        $producto->load([
            'marca:idMarca,nombreMarca', 
            'proveedor:idProveedor,nombreProveedor',
            'categorias'
        ]);
    
        return $this->sendResponse($producto, 'Producto creado correctamente');
    }

    /**
     * @OA\Patch(
     * path="/api/productos/actualizar/{id}",
     * summary="Actualiza parcialmente un producto existente.",
     * tags={"Productos"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del producto a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar parcialmente el producto. Los campos son opcionales (sometimes).",
     * @OA\JsonContent(ref="#/components/schemas/ProductoUpdateInput")
     * ),
     * @OA\Response(
     * response=200,
     * description="Producto actualizado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Producto actualizado correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/ProductoDetalle")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Producto no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=422,
     * description="Errores de validación.",
     * @OA\JsonContent(ref="#/components/schemas/ValidationError")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
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
            'nombreProducto',
            'definicion',
            'valorProducto',
            'cantidadStock',
            'idMarca',
            'idProveedor'
        ]);

        if (isset($data['cantidadStock'])) {
            $data['disponibilidad'] = ($data['cantidadStock'] > 0) ? 1 : 0;
        }

        $producto->fill($data);
        $producto->save();

        if ($request->has('categorias')) {
            $producto->categorias()->sync($request->categorias);
        }

        return $this->sendResponse($producto->load(['marca', 'categorias', 'proveedor']), 'Producto actualizado correctamente');
    }

    /**
     * @OA\Delete(
     * path="/api/productos/eliminar/{id}",
     * summary="Elimina un producto.",
     * tags={"Productos"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del producto a eliminar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Producto eliminado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Producto eliminado correctamente"),
     * @OA\Property(property="data", type="array", * @OA\Items(type="object"),example={})
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Producto no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=409,
     * description="Conflicto: No se puede eliminar el producto porque está asociado a pedidos o carritos (si se implementa la lógica).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
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
     * @OA\Get(
     * path="/api/productos/{id}/categorias",
     * summary="Obtiene las categorías asociadas a un producto específico.",
     * tags={"Productos"},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del producto para obtener sus categorías.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Categorías del producto obtenidas correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Categorías del producto obtenidas correctamente."),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/Categoria")
     * )
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Producto no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
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
     * @OA\Patch(
     * path="/api/productos/{id}/categorias",
     * summary="Sincroniza las categorías de un producto.",
     * tags={"Productos"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del producto para sincronizar sus categorías.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Array de IDs de categorías para asociar al producto.",
     * @OA\JsonContent(
     * required={"categorias"},
     * @OA\Property(
     * property="categorias",
     * type="array",
     * @OA\Items(type="integer", format="int64", example=1),
     * description="Lista de IDs de categorías."
     * )
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Categorías del producto actualizadas correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Categorías del producto actualizadas correctamente."),
     * @OA\Property(property="data", ref="#/components/schemas/ProductoDetalle")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Producto no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=422,
     * description="Errores de validación.",
     * @OA\JsonContent(ref="#/components/schemas/ValidationError")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
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
     * path="/api/productos/productos-bajo-stock",
     * summary="Obtiene productos con stock bajo (para administración).",
     * tags={"Productos"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Productos con stock bajo obtenidos correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Productos con stock bajo obtenidos correctamente."),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/ProductoDetalle")
     * )
     * )
     * ),
     * @OA\Response(
     * response=500,
     * description="Error al obtener productos con stock bajo.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function getProductosBajoStock()
    {
        Log::info('ProductoController@getProductosBajoStock - Solicitud de productos con stock bajo.');
        try {
            $umbralStockBajo = 10; // Puedes ajustar este valor según tus necesidades
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
