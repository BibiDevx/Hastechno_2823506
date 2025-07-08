<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proveedor;
use App\Http\Controllers\BaseController; // Asegúrate de que BaseController esté disponible
use Illuminate\Support\Facades\Validator; // Para usar Validator::make, que es más flexible

/**
 * @OA\Tag(
 * name="Proveedores",
 * description="Operaciones relacionadas con la gestión de proveedores."
 * )
 */
class proveedorController extends BaseController
{
    /**
     * @OA\Get(
     * path="/api/proveedores/verProveedores",
     * summary="Obtener todos los proveedores",
     * tags={"Proveedores"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Lista de proveedores obtenida correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Lista de proveedores obtenida correctamente"),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/Proveedor")
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
        $proveedores = Proveedor::all();
        return $this->sendResponse($proveedores, 'Lista de proveedores obtenida correctamente');
    }

    /**
     * @OA\Post(
     * path="/api/proveedores/registrar",
     * summary="Crear un nuevo proveedor",
     * tags={"Proveedores"},
     * security={{"bearerAuth": {}}},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para crear un nuevo proveedor.",
     * @OA\JsonContent(
     * required={"nombreProveedor", "emailProveedor", "telefonoProveedor"},
     * @OA\Property(property="nombreProveedor", type="string", maxLength=255, description="Nombre del proveedor.", example="Proveedor ABC"),
     * @OA\Property(property="emailProveedor", type="string", format="email", maxLength=255, description="Correo electrónico único del proveedor.", example="contacto@proveedorabc.com"),
     * @OA\Property(property="telefonoProveedor", type="string", maxLength=20, description="Número de teléfono del proveedor.", example="1234567890")
     * )
     * ),
     * @OA\Response(
     * response=201,
     * description="Proveedor creado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Proveedor creado correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/Proveedor")
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
        // Usar Validator::make para un mejor control de los errores
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
     * path="/api/proveedores/proveedores/{id}",
     * summary="Obtener un proveedor por ID",
     * tags={"Proveedores"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del proveedor a obtener.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Proveedor obtenido correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Proveedor obtenido correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/Proveedor")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Proveedor no encontrado.",
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
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado', [], 404);
        }

        return $this->sendResponse($proveedor, 'Proveedor obtenido correctamente');
    }

    /**
     * @OA\Patch(
     * path="/api/proveedores/actualizar/{id}",
     * summary="Actualizar parcialmente un proveedor",
     * tags={"Proveedores"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del proveedor a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar parcialmente el proveedor. Los campos son opcionales (sometimes).",
     * @OA\JsonContent(
     * @OA\Property(property="nombreProveedor", type="string", maxLength=255, description="Nuevo nombre del proveedor."),
     * @OA\Property(property="emailProveedor", type="string", format="email", maxLength=255, description="Nuevo correo electrónico único del proveedor."),
     * @OA\Property(property="telefonoProveedor", type="string", maxLength=20, description="Nuevo número de teléfono del proveedor.")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Proveedor actualizado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Proveedor actualizado correctamente"),
     * @OA\Property(property="data", ref="#/components/schemas/Proveedor")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Proveedor no encontrado.",
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
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado', [], 404);
        }

        // Usar Validator::make
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
     * path="/api/proveedores/eliminar/{id}",
     * summary="Eliminar un proveedor",
     * tags={"Proveedores"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del proveedor a eliminar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Proveedor eliminado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Proveedor eliminado correctamente"),
     * @OA\Property(property="data", type="array",* @OA\Items(type="object"), example={})
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Proveedor no encontrado.",
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
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado', [], 404);
        }

        // Puedes añadir validaciones adicionales aquí, por ejemplo, si el proveedor tiene productos asociados
        // $productosAsociados = $proveedor->productos()->count();
        // if ($productosAsociados > 0) {
        //     return $this->sendError('No se puede eliminar el proveedor porque tiene productos asociados.', [], 409);
        // }

        $proveedor->delete();

        return $this->sendResponse([], 'Proveedor eliminado correctamente');
    }
}
