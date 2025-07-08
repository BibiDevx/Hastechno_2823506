<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Marca;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator; // Necesario para la validación manual

/**
 * @OA\Tag(
 * name="Marcas",
 * description="Operaciones relacionadas con la gestión de marcas de productos."
 * )
 *
 * @OA\Schema(
 * schema="MarcaInput",
 * title="Entrada de Marca",
 * description="Datos para crear o actualizar una marca.",
 * @OA\Property(property="nombreMarca", type="string", maxLength=255, description="Nombre de la marca.", example="Logitech")
 * )
 */
class marcaController extends BaseController
{
    /**
     * @OA\Get(
     * path="/api/verMarcas/",
     * summary="Obtener todas las marcas",
     * tags={"Marcas"},
     * @OA\Response(
     * response=200,
     * description="Lista de marcas obtenida correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Lista de marcas obtenida correctamente"),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/Marca")
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
        $marcas = Marca::all();
        return $this->sendResponse($marcas, 'Lista de marcas obtenida correctamente');
    }

    /**
     * @OA\Post(
     * path="/api/marcas/registrar",
     * summary="Crear una nueva marca",
     * tags={"Marcas"},
     * security={{"bearerAuth": {}}},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para crear una nueva marca.",
     * @OA\JsonContent(ref="#/components/schemas/MarcaInput")
     * ),
     * @OA\Response(
     * response=201,
     * description="Marca creada correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Marca creada correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/Marca")
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
            'nombreMarca' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $marca = Marca::create([
            'nombreMarca' => $request->nombreMarca
        ]);

        return $this->sendResponse($marca, 'Marca creada correctamente');
    }

    /**
     * @OA\Get(
     * path="/api/verMarcas/{id}",
     * summary="Obtener una marca por ID",
     * tags={"Marcas"},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID de la marca a obtener.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Marca obtenida correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Marca obtenida correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/Marca")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Marca no encontrada.",
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
        $marca = Marca::find($id);

        if (!$marca) {
            return $this->sendError('Marca no encontrada');
        }

        return $this->sendResponse($marca, 'Marca obtenida correctamente');
    }

    /**
     * @OA\Patch(
     * path="/api/marcas/actualizar/{id}",
     * summary="Actualizar parcialmente una marca existente",
     * tags={"Marcas"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID de la marca a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar parcialmente la marca. El campo 'nombreMarca' es opcional (sometimes).",
     * @OA\JsonContent(ref="#/components/schemas/MarcaInput")
     * ),
     * @OA\Response(
     * response=200,
     * description="Marca actualizada correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Marca actualizada correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/Marca")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Marca no encontrada.",
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
        $marca = Marca::find($id);

        if (!$marca) {
            return $this->sendError('Marca no encontrada');
        }

        $validator = Validator::make($request->all(), [
            'nombreMarca' => 'sometimes|required|string|max:255|unique:marca,nombreMarca,' . $id . ',idMarca', // Añadido unique para PATCH
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $marca->fill($request->only(['nombreMarca']));
        $marca->save();

        return $this->sendResponse($marca, 'Marca actualizada correctamente');
    }

    /**
     * @OA\Delete(
     * path="/api/marcas/eliminar/{id}",
     * summary="Eliminar una marca",
     * tags={"Marcas"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID de la marca a eliminar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Marca eliminada correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Marca eliminada correctamente"),
     * @OA\Property(property="data", type="array",* @OA\Items(type="object"), example={})
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Marca no encontrada.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=409,
     * description="Conflicto: No se puede eliminar la marca porque tiene productos asociados (si se implementa la lógica).",
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
        $marca = Marca::find($id);

        if (!$marca) {
            return $this->sendError('Marca no encontrada');
        }

        // Se recomienda añadir lógica para verificar si la marca tiene productos asociados antes de eliminar.
        // Ejemplo:
        // if ($marca->productos()->exists()) {
        //     return $this->sendError('No se puede eliminar la marca porque tiene productos asociados.', [], 409);
        // }

        $marca->delete();

        return $this->sendResponse([], 'Marca eliminada correctamente');
    }
}
