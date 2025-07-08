<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

/**
 * @OA\Tag(
 *     name="Administradores",
 *     description="Operaciones relacionadas con los administradores"
 * )
 */
class adminController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/admins",
     *     summary="Listar todos los administradores",
     *     tags={"Administradores"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de administradores obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="idAdmin", type="integer", example=1),
     *                 @OA\Property(property="nombreAdmin", type="string", example="Carlos"),
     *                 @OA\Property(property="usuario", type="object",
     *                     @OA\Property(property="idUsuario", type="integer", example=1),
     *                     @OA\Property(property="email", type="string", example="admin@correo.com")
     *                 )
     *             )),
     *             @OA\Property(property="message", type="string", example="Lista de admins obtenida exitosamente.")
     *         )
     *     )
     * )
     */
    public function index()
    {
        $admins = Admin::with('usuario:idUsuario,email')->get();
        return $this->sendResponse($admins, 'Lista de admins obtenida exitosamente.');
    }

    /**
     * @OA\Get(
     *     path="/api/admins/{id}",
     *     summary="Obtener un administrador por ID",
     *     tags={"Administradores"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del administrador",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Admin encontrado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="idAdmin", type="integer", example=1),
     *                 @OA\Property(property="nombreAdmin", type="string", example="Carlos"),
     *                 @OA\Property(property="usuario", type="object",
     *                     @OA\Property(property="idUsuario", type="integer", example=1),
     *                     @OA\Property(property="email", type="string", example="admin@correo.com")
     *                 )
     *             ),
     *             @OA\Property(property="message", type="string", example="Admin encontrado.")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Admin no encontrado")
     * )
     */
    public function show($id)
    {
        $admin = Admin::with('usuario:idUsuario,email')->find($id);
        if (!$admin) {
            return $this->sendError('Admin no encontrado.', [], 404);
        }
        return $this->sendResponse($admin, 'Admin encontrado.');
    }

    /**
     * @OA\Patch(
     *     path="/api/admins/update",
     *     summary="Actualizar parcialmente el admin autenticado",
     *     tags={"Administradores"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombreAdmin", type="string", example="Carlos"),
     *             @OA\Property(property="apellidoAdmin", type="string", example="Ramírez"),
     *             @OA\Property(property="cedulaAdmin", type="string", example="1234567890"),
     *             @OA\Property(property="telefonoAdmin", type="string", example="3001234567"),
     *             @OA\Property(property="email", type="string", example="nuevo@correo.com"),
     *             @OA\Property(property="password", type="string", example="nuevaClave123"),
     *             @OA\Property(property="idRol", type="integer", example=2)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Administrador actualizado correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Administrador actualizado correctamente.")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Admin no encontrado"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
    public function updatePartial(Request $request)
    {
        $usuario = auth()->user();
        $admin = $usuario->admin;

        if (!$admin) {
            return $this->sendError('Admin no encontrado.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombreAdmin' => 'sometimes|string|max:255',
            'apellidoAdmin' => 'sometimes|string|max:255',
            'cedulaAdmin' => 'sometimes|numeric|unique:admin,cedulaAdmin,' . $admin->idAdmin . ',idAdmin',
            'telefonoAdmin' => 'sometimes|numeric',
            'email' => 'sometimes|email|max:255|unique:usuario,email,' . $usuario->idUsuario . ',idUsuario',
            'password' => 'sometimes|string|min:6',
            'idRol' => 'sometimes|exists:rol,idRol',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $input = $request->only(['nombreAdmin', 'apellidoAdmin', 'cedulaAdmin', 'telefonoAdmin']);
        $inputUsuario = [];

        if ($request->has('email')) {
            $inputUsuario['email'] = $request->email;
        }

        if ($request->has('password')) {
            $inputUsuario['password'] = Hash::make($request->password);
        }

        if ($usuario->rol->nombreRol === 'SuperAdmin' && $request->has('idRol')) {
            $inputUsuario['idRol'] = $request->idRol;
        }

        $admin->update($input);

        if (!empty($inputUsuario)) {
            $usuario->update($inputUsuario);
        }

        $admin->load('usuario:idUsuario,email');

        return $this->sendResponse($admin, 'Administrador actualizado correctamente.');
    }

    /**
     * @OA\Delete(
     *     path="/api/admins/{id}",
     *     summary="Eliminar un administrador (solo SuperAdmin)",
     *     tags={"Administradores"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del administrador a eliminar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Administrador eliminado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Administrador y su usuario fueron eliminados correctamente.")
     *         )
     *     ),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Administrador no encontrado")
     * )
     */
    public function destroy($id)
    {
        $usuario = auth()->user();

        if ($usuario->rol->nombreRol !== 'SuperAdmin') {
            return $this->sendError('No autorizado. Solo SuperAdmin puede eliminar administradores.', [], 403);
        }

        $admin = Admin::find($id);
        if (!$admin) {
            return $this->sendError('Administrador no encontrado.', [], 404);
        }

        $usuarioRelacionado = $admin->usuario;

        $admin->delete();

        if ($usuarioRelacionado) {
            $usuarioRelacionado->delete();
        }

        return $this->sendResponse([], 'Administrador y su usuario fueron eliminados correctamente.');
    }

    /**
     * @OA\Put(
     *     path="/api/users/actualizar/admin/{id}",
     *     summary="Actualizar un administrador por SuperAdmin",
     *     tags={"Administradores"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del administrador a actualizar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombreAdmin", type="string", example="Luis"),
     *             @OA\Property(property="apellidoAdmin", type="string", example="Gómez"),
     *             @OA\Property(property="cedulaAdmin", type="string", example="987654321"),
     *             @OA\Property(property="telefonoAdmin", type="string", example="3219876543"),
     *             @OA\Property(property="email", type="string", example="nuevoadmin@correo.com"),
     *             @OA\Property(property="password", type="string", example="claveNueva"),
     *             @OA\Property(property="idRol", type="integer", example=2)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Administrador actualizado correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Admin actualizado correctamente.")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Admin no encontrado"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
    public function actualizarAdmins(Request $request, $id)
    {
        $admin = Admin::find($id);
        if (!$admin) {
            return $this->sendError('Admin no encontrado.', [], 404);
        }

        $usuarioAutenticado = auth()->user();

        $validator = Validator::make($request->all(), [
            'nombreAdmin' => 'sometimes|string|max:255',
            'apellidoAdmin' => 'sometimes|string|max:255',
            'cedulaAdmin' => 'sometimes|numeric|unique:admin,cedulaAdmin,' . $id . ',idAdmin',
            'telefonoAdmin' => 'sometimes|numeric',
            'email' => 'sometimes|email|max:255|unique:usuario,email,' . $admin->idUsuario . ',idUsuario',
            'password' => 'sometimes|string|min:6',
            'idRol' => 'sometimes|exists:rol,idRol',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $input = $request->only(['nombreAdmin', 'apellidoAdmin', 'cedulaAdmin', 'telefonoAdmin']);
        $inputUsuario = [];

        if ($request->has('password')) {
            $inputUsuario['password'] = Hash::make($request->password);
        }

        if ($request->has('email')) {
            $inputUsuario['email'] = $request->email;
        }

        if ($usuarioAutenticado->rol->nombreRol === 'SuperAdmin' && $request->has('idRol')) {
            $inputUsuario['idRol'] = $request->idRol;
        }

        $admin->update($input);

        if (!empty($inputUsuario)) {
            $admin->usuario()->update($inputUsuario);
        }

        $admin->load('usuario:idUsuario,email');

        return $this->sendResponse($admin, 'Admin actualizado correctamente.');
    }
}
