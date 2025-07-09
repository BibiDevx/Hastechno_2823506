<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\User; // Asegúrate de que este 'use' exista si tu modelo de Usuario se llama 'User'
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

/**
 * @OA\Tag(
 * name="Administradores",
 * description="Operaciones relacionadas con la gestión de administradores."
 * )
 *
 *
 * @OA\Schema(
 * schema="UserBasic",
 * title="Usuario Básico",
 * description="Información básica del usuario asociado al administrador.",
 * @OA\Property(
 * property="idUsuario",
 * type="integer",
 * format="int64",
 * description="ID único del usuario."
 * ),
 * @OA\Property(
 * property="email",
 * type="string",
 * format="email",
 * description="Correo electrónico del usuario."
 * )
 * )
 */
class adminController extends BaseController
{
    /**
     * @OA\Get(
     * path="/api/users/show",
     * summary="Obtener todos los administradores",
     * tags={"Administradores"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Lista de administradores obtenida exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Lista de admins obtenida exitosamente."),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/Admin")
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
        // Carga ansiosa (eager loading) de la relación 'usuario',
        // seleccionando solo las columnas 'idUsuario' y 'email'.
        $admins = Admin::with('usuario:idUsuario,email')->get();
        return $this->sendResponse($admins, 'Lista de admins obtenida exitosamente.');
    }

    /**
     * @OA\Get(
     * path="/api/users/ver/admin/{id}",
     * summary="Obtener un administrador por ID",
     * tags={"Administradores"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del administrador a obtener.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Administrador encontrado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Admin encontrado."),
     * @OA\Property(property="data", ref="#/components/schemas/Admin")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Admin no encontrado.",
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
        // Carga ansiosa de la relación 'usuario' también para una búsqueda individual.
        $admin = Admin::with('usuario:idUsuario,email')->find($id);
        if (!$admin) {
            return $this->sendError('Admin no encontrado.', [], 404);
        }
        return $this->sendResponse($admin, 'Admin encontrado.');
    }

    /**
     * @OA\Patch(
     * path="/api/admin/actualizar/datos",
     * summary="Actualizar el perfil del administrador autenticado",
     * tags={"Administradores", "Perfil"},
     * security={{"bearerAuth": {}}},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar el perfil del administrador. Los campos son opcionales (sometimes).",
     * @OA\JsonContent(
     * @OA\Property(property="nombreAdmin", type="string", maxLength=255, description="Nuevo nombre del administrador."),
     * @OA\Property(property="apellidoAdmin", type="string", maxLength=255, description="Nuevo apellido del administrador."),
     * @OA\Property(property="cedulaAdmin", type="string", description="Nueva cédula del administrador (debe ser única)."),
     * @OA\Property(property="telefonoAdmin", type="string", description="Nuevo teléfono del administrador."),
     * @OA\Property(property="email", type="string", format="email", maxLength=255, description="Nuevo correo electrónico del usuario (debe ser único)."),
     * @OA\Property(property="password", type="string", minLength=6, description="Nueva contraseña (mínimo 6 caracteres)."),
     * @OA\Property(property="idRol", type="integer", format="int64", description="ID del nuevo rol (solo si el usuario autenticado es SuperAdmin).")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Administrador actualizado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Administrador actualizado correctamente."),
     * @OA\Property(property="data", ref="#/components/schemas/Admin")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Admin no encontrado.",
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
    public function updatePartial(Request $request)
    {
        $usuario = auth()->user(); // Usuario autenticado
        $admin = $usuario->admin; // Relación: usuario -> admin

        if (!$admin) {
            return $this->sendError('Admin no encontrado.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombreAdmin' => 'sometimes|string|max:255|regex:/^[\pL\s\-]+$/u',
            'apellidoAdmin' => 'sometimes|string|max:255|regex:/^[\pL\s\-]+$/u',
            'cedulaAdmin' => 'sometimes|numeric|unique:admin,cedulaAdmin,' . $admin->idAdmin . ',idAdmin', // Usando 'admin' como nombre de tabla singular
            'telefonoAdmin' => 'sometimes|numeric',
            'email' => 'sometimes|email|max:255|unique:usuario,email,' . $usuario->idUsuario . ',idUsuario', // Usando 'usuario' como nombre de tabla singular
            'password' => 'sometimes|string|min:6',
            'idRol' => 'sometimes|exists:rol,idRol', // Usando 'rol' como nombre de tabla singular
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $input = $request->only([
            'nombreAdmin',
            'apellidoAdmin',
            'cedulaAdmin',
            'telefonoAdmin'
        ]);

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
        
        // Recarga el admin con la relación 'usuario' actualizada
        // para que la respuesta contenga el email y otros datos del usuario.
        $admin->load('usuario:idUsuario,email'); 

        return $this->sendResponse($admin, 'Administrador actualizado correctamente.');
    }

    /**
     * @OA\Delete(
     * path="/api/users/delete/admin/{id}",
     * summary="Eliminar un administrador (solo SuperAdmin)",
     * tags={"Administradores"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del administrador a eliminar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Administrador y su usuario fueron eliminados correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Administrador y su usuario fueron eliminados correctamente."),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(type="object"),
     * example={}
     * )
     * )
     * ),
     * @OA\Response(
     * response=403,
     * description="No autorizado. Solo SuperAdmin puede eliminar administradores.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=404,
     * description="Administrador no encontrado.",
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
        $usuario = auth()->user();

        if ($usuario->rol->nombreRol !== 'SuperAdmin') {
            return $this->sendError('No autorizado. Solo SuperAdmin puede eliminar administradores.', [], 403);
        }

        $admin = Admin::find($id);
        if (!$admin) {
            return $this->sendError('Administrador no encontrado.', [], 404);
        }

        $usuarioRelacionado = $admin->usuario; // Accede a la relación para obtener el usuario

        $admin->delete();

        if ($usuarioRelacionado) {
            $usuarioRelacionado->delete();
        }

        return $this->sendResponse([], 'Administrador y su usuario fueron eliminados correctamente.');
    }

    /**
     * @OA\Patch(
     * path="/api/users/actualizar/admin/{id}",
     * summary="Actualizar un administrador por ID (solo SuperAdmin)",
     * tags={"Administradores"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del administrador a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar el administrador. Los campos son opcionales (sometimes).",
     * @OA\JsonContent(
     * @OA\Property(property="nombreAdmin", type="string", maxLength=255, description="Nuevo nombre del administrador."),
     * @OA\Property(property="apellidoAdmin", type="string", maxLength=255, description="Nuevo apellido del administrador."),
     * @OA\Property(property="cedulaAdmin", type="string", description="Nueva cédula del administrador (debe ser única)."),
     * @OA\Property(property="telefonoAdmin", type="string", description="Nuevo teléfono del administrador."),
     * @OA\Property(property="email", type="string", format="email", maxLength=255, description="Nuevo correo electrónico del usuario (debe ser único)."),
     * @OA\Property(property="password", type="string", minLength=6, description="Nueva contraseña (mínimo 6 caracteres)."),
     * @OA\Property(property="idRol", type="integer", format="int64", description="ID del nuevo rol (solo si el usuario autenticado es SuperAdmin).")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Admin actualizado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Admin actualizado correctamente."),
     * @OA\Property(property="data", ref="#/components/schemas/Admin")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Admin no encontrado.",
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
            // Valida el email contra la tabla 'usuario' y excluye el ID del usuario actual del admin que se está editando
            'email' => 'sometimes|email|max:255|unique:usuario,email,' . $admin->idUsuario . ',idUsuario', 
            'password' => 'sometimes|string|min:6',
            'idRol' => 'sometimes|exists:rol,idRol',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $input = $request->only([
            'nombreAdmin',
            'apellidoAdmin',
            'cedulaAdmin',
            'telefonoAdmin'
        ]);

        $inputUsuario = [];

        if ($request->has('password')) {
            $inputUsuario['password'] = Hash::make($request->password);
        }

        if ($request->has('email')) {
            $inputUsuario['email'] = $request->email;
        }

        // Si el usuario autenticado es SuperAdmin, permitir actualizar el rol
        if ($usuarioAutenticado->rol->nombreRol === 'SuperAdmin' && $request->has('idRol')) {
            $inputUsuario['idRol'] = $request->idRol;
        }

        $admin->update($input);

        // Actualizar la información en la tabla `usuario` si hay cambios de email/password/rol
        if (!empty($inputUsuario)) {
            $admin->usuario()->update($inputUsuario); 
        }
        
        // Recarga el admin con la relación 'usuario' actualizada
        // para que la respuesta contenga el email y otros datos del usuario.
        $admin->load('usuario:idUsuario,email'); 

        return $this->sendResponse($admin, 'Admin actualizado correctamente.');
    }
}
