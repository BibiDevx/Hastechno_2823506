<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proveedor;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Proveedores",
 *     description="Gestión de proveedores"
 * )
 */
class proveedorController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/proveedores",
     *     summary="Obtener lista de proveedores",
     *     tags={"Proveedores"},
     *     @OA\Response(response=200, description="Lista de proveedores obtenida correctamente")
     * )
     */
    public function index()
    {
        $proveedores = Proveedor::all();
        return $this->sendResponse($proveedores, 'Lista de proveedores obtenida correctamente');
    }

    /**
     * @OA\Post(
     *     path="/api/proveedores",
     *     summary="Crear un nuevo proveedor",
     *     tags={"Proveedores"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombreProveedor", "emailProveedor", "telefonoProveedor"},
     *             @OA\Property(property="nombreProveedor", type="string", example="Proveedor ABC"),
     *             @OA\Property(property="emailProveedor", type="string", example="proveedor@ejemplo.com"),
     *             @OA\Property(property="telefonoProveedor", type="string", example="3112223344")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Proveedor creado correctamente"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombreProveedor' => 'required|string|max:255',
            'emailProveedor' => 'required|email|max:255|unique:proveedor,emailProveedor',
            'telefonoProveedor' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $proveedor = Proveedor::create([
            'nombreProveedor' => $request->nombreProveedor,
            'emailProveedor' => $request->emailProveedor,
            'telefonoProveedor' => $request->telefonoProveedor,
        ]);

        return $this->sendResponse($proveedor, 'Proveedor creado correctamente');
    }

    /**
     * @OA\Get(
     *     path="/api/proveedores/{id}",
     *     summary="Obtener un proveedor por ID",
     *     tags={"Proveedores"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del proveedor",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Proveedor obtenido correctamente"),
     *     @OA\Response(response=404, description="Proveedor no encontrado")
     * )
     */
    public function show($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado', [], 404);
        }

        return $this->sendResponse($proveedor, 'Proveedor obtenido correctamente');
    }

    /**
     * @OA\Patch(
     *     path="/api/proveedores/{id}",
     *     summary="Actualizar parcialmente un proveedor",
     *     tags={"Proveedores"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del proveedor a actualizar",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="nombreProveedor", type="string", example="Proveedor Actualizado"),
     *             @OA\Property(property="emailProveedor", type="string", example="actualizado@ejemplo.com"),
     *             @OA\Property(property="telefonoProveedor", type="string", example="3004445566")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Proveedor actualizado correctamente"),
     *     @OA\Response(response=404, description="Proveedor no encontrado"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
    public function updatePartial(Request $request, $id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombreProveedor' => 'sometimes|required|string|max:255',
            'emailProveedor' => 'sometimes|required|email|max:255|unique:proveedor,emailProveedor,' . $id . ',idProveedor',
            'telefonoProveedor' => 'sometimes|required|string|max:20',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $proveedor->fill($request->only(['nombreProveedor', 'emailProveedor', 'telefonoProveedor']));
        $proveedor->save();

        return $this->sendResponse($proveedor, 'Proveedor actualizado correctamente');
    }

    /**
     * @OA\Delete(
     *     path="/api/proveedores/{id}",
     *     summary="Eliminar un proveedor",
     *     tags={"Proveedores"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del proveedor",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Proveedor eliminado correctamente"),
     *     @OA\Response(response=404, description="Proveedor no encontrado")
     * )
     */
    public function destroy($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado', [], 404);
        }

        // Aquí podrías validar que no tenga productos asociados antes de eliminar

        $proveedor->delete();

        return $this->sendResponse([], 'Proveedor eliminado correctamente');
    }
}
