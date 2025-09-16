<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator; // Necesario para la validación manual

/**
 * @OA\Tag(
 * name="Categorías",
 * description="Operaciones relacionadas con la gestión de categorías de productos."
 * )
 *
 * @OA\Schema(
 * schema="CategoriaInput",
 * title="Entrada de Categoría",
 * description="Datos para crear o actualizar una categoría.",
 * @OA\Property(property="nombreCategoria", type="string", maxLength=255, description="Nombre de la categoría.", example="Electrónica")
 * )
 */
class categoriaController extends BaseController
{
    /**
     * @OA\Get(
     * path="/api/verCategorias/",
     * summary="Obtener todas las categorías",
     * tags={"Categorías"},
     * @OA\Response(
     * response=200,
     * description="Lista de categorías obtenida correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Lista de categorías obtenida correctamente"),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/Categoria")
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
    public function index()
    {
        $categorias = Categoria::all();
        return $this->sendResponse($categorias, 'Lista de categorías obtenida correctamente');
    }

    /**
     * @OA\Post(
     * path="/api/categorias/registrar",
     * summary="Crear una nueva categoría",
     * tags={"Categorías"},
     * security={{"bearerAuth": {}}},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para crear una nueva categoría.",
     * @OA\JsonContent(ref="#/components/schemas/CategoriaInput")
     * ),
     * @OA\Response(
     * response=201,
     * description="Categoría creada correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Categoría creada correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/Categoria")
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
            'nombreCategoria' => 'required|string|max:255|unique:categoria,nombreCategoria', // Added unique validation
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $categoria = Categoria::create([
            'nombreCategoria' => $request->nombreCategoria
        ]);

        return $this->sendResponse($categoria, 'Categoría creada correctamente');
    }

    /**
     * @OA\Get(
     * path="/api/verCategorias/{id}",
     * summary="Obtener una categoría por ID",
     * tags={"Categorías"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID de la categoría a obtener.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Categoría obtenida correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Categoría obtenida correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/Categoria")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Categoría no encontrada.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function show($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return $this->sendError('Categoría no encontrada');
        }

        return $this->sendResponse($categoria, 'Categoría obtenida correctamente');
    }

    /**
     * @OA\Patch(
     * path="/api/categorias/actualizar/{id}",
     * summary="Actualizar parcialmente una categoría existente",
     * tags={"Categorías"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID de la categoría a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar parcialmente la categoría. El campo 'nombreCategoria' es opcional (sometimes).",
     * @OA\JsonContent(ref="#/components/schemas/CategoriaInput")
     * ),
     * @OA\Response(
     * response=200,
     * description="Categoría actualizada correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Categoría actualizada correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/Categoria")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Categoría no encontrada.",
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
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return $this->sendError('Categoría no encontrada');
        }

        $validator = Validator::make($request->all(), [
            'nombreCategoria' => 'sometimes|required|string|max:255|unique:categoria,nombreCategoria,' . $id . ',idCategoria',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $categoria->fill($request->only(['nombreCategoria']));
        $categoria->save();

        return $this->sendResponse($categoria, 'Categoría actualizada correctamente');
    }

    /**
     * @OA\Delete(
     * path="/api/categorias/eliminar/{id}",
     * summary="Eliminar una categoría",
     * tags={"Categorías"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID de la categoría a eliminar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Categoría eliminada correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Categoría eliminada correctamente"),
     * @OA\Property(property="data", type="array", * @OA\Items(type="object"),example={})
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Categoría no encontrada.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=409,
     * description="Conflicto: No se puede eliminar la categoría porque tiene productos asociados (si se implementa la lógica).",
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
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return $this->sendError('Categoría no encontrada');
        }

        if ($categoria->productos()->exists()) {
            return $this->sendError(
                'No se puede eliminar la categoría porque tiene productos asociados.',
                [],
                409
            );
        }

        try {
            $categoria->delete();

            return $this->sendResponse([], 'Categoría eliminada correctamente');

        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == '23000') { // Restricción FK violada
                return $this->sendError(
                    'No se puede eliminar la categoría porque tiene productos asociados.',
                    [],
                    409
                );
            }

            return $this->sendError('Error al eliminar la categoría', [], 500);
        }
    }
}
