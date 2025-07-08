<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;
use App\Http\Controllers\BaseController;

/**
 * @OA\Tag(
 *     name="Categorías",
 *     description="Operaciones relacionadas con las categorías de productos"
 * )
 */
class categoriaController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/categorias",
     *     summary="Listar todas las categorías",
     *     tags={"Categorías"},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de categorías obtenida correctamente"
     *     )
     * )
     */
    public function index()
    {
        $categorias = Categoria::all();
        return $this->sendResponse($categorias, 'Lista de categorías obtenida correctamente');
    }

    /**
     * @OA\Post(
     *     path="/api/categorias",
     *     summary="Crear una nueva categoría",
     *     tags={"Categorías"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombreCategoria"},
     *             @OA\Property(property="nombreCategoria", type="string", example="Electrónica")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Categoría creada correctamente"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Errores de validación"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombreCategoria' => 'required|string|max:255',
        ]);

        $categoria = Categoria::create([
            'nombreCategoria' => $request->nombreCategoria
        ]);

        return $this->sendResponse($categoria, 'Categoría creada correctamente');
    }

    /**
     * @OA\Get(
     *     path="/api/categorias/{id}",
     *     summary="Obtener una categoría por su ID",
     *     tags={"Categorías"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la categoría",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Categoría obtenida correctamente"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Categoría no encontrada"
     *     )
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
     *     path="/api/categorias/{id}",
     *     summary="Actualizar parcialmente una categoría",
     *     tags={"Categorías"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la categoría",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="nombreCategoria", type="string", example="Hogar y cocina")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Categoría actualizada correctamente"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Categoría no encontrada"
     *     )
     * )
     */
    public function updatePartial(Request $request, $id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return $this->sendError('Categoría no encontrada');
        }

        $request->validate([
            'nombreCategoria' => 'sometimes|required|string|max:255',
        ]);

        $categoria->fill($request->only(['nombreCategoria']));
        $categoria->save();

        return $this->sendResponse($categoria, 'Categoría actualizada correctamente');
    }

    /**
     * @OA\Delete(
     *     path="/api/categorias/{id}",
     *     summary="Eliminar una categoría",
     *     tags={"Categorías"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la categoría",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Categoría eliminada correctamente"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Categoría no encontrada"
     *     )
     * )
     */
    public function destroy($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return $this->sendError('Categoría no encontrada');
        }

        $categoria->delete();

        return $this->sendResponse([], 'Categoría eliminada correctamente');
    }
}
