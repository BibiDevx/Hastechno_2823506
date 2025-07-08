<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Marca;
use App\Http\Controllers\BaseController;

class marcaController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/marcas",
     *     summary="Listar todas las marcas",
     *     tags={"Marcas"},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de marcas obtenida correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="idMarca", type="integer", example=1),
     *                 @OA\Property(property="nombreMarca", type="string", example="Samsung")
     *             ))
     *         )
     *     )
     * )
     */
    public function index()
    {
        $marcas = Marca::all();
        return $this->sendResponse($marcas, 'Lista de marcas obtenida correctamente');
    }

    /**
     * @OA\Post(
     *     path="/api/marcas",
     *     summary="Crear una nueva marca",
     *     tags={"Marcas"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombreMarca"},
     *             @OA\Property(property="nombreMarca", type="string", example="Apple")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Marca creada correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="idMarca", type="integer", example=1),
     *                 @OA\Property(property="nombreMarca", type="string", example="Apple")
     *             )
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombreMarca' => 'required|string|max:255',
        ]);

        $marca = Marca::create([
            'nombreMarca' => $request->nombreMarca
        ]);

        return $this->sendResponse($marca, 'Marca creada correctamente');
    }

    /**
     * @OA\Get(
     *     path="/api/marcas/{id}",
     *     summary="Obtener una marca por ID",
     *     tags={"Marcas"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la marca",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Marca obtenida correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="idMarca", type="integer", example=1),
     *                 @OA\Property(property="nombreMarca", type="string", example="Sony")
     *             )
     *         )
     *     )
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
     *     path="/api/marcas/{id}",
     *     summary="Actualizar parcialmente una marca",
     *     tags={"Marcas"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la marca a actualizar",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombreMarca", type="string", example="LG")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Marca actualizada correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="idMarca", type="integer", example=1),
     *                 @OA\Property(property="nombreMarca", type="string", example="LG")
     *             )
     *         )
     *     )
     * )
     */
    public function updatePartial(Request $request, $id)
    {
        $marca = Marca::find($id);

        if (!$marca) {
            return $this->sendError('Marca no encontrada');
        }

        $request->validate([
            'nombreMarca' => 'sometimes|required|string|max:255',
        ]);

        $marca->fill($request->only(['nombreMarca']));
        $marca->save();

        return $this->sendResponse($marca, 'Marca actualizada correctamente');
    }

    /**
     * @OA\Delete(
     *     path="/api/marcas/{id}",
     *     summary="Eliminar una marca",
     *     tags={"Marcas"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la marca a eliminar",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Marca eliminada correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items())
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        $marca = Marca::find($id);

        if (!$marca) {
            return $this->sendError('Marca no encontrada');
        }

        $marca->delete();

        return $this->sendResponse([], 'Marca eliminada correctamente');
    }
}
