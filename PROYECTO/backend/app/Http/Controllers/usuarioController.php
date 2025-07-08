<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Rol;
use App\Models\Admin;
use App\Models\Cliente;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Usuarios",
 *     description="Operaciones relacionadas con usuarios del sistema"
 * )
 */
class usuarioController extends BaseController
{
    /**
     * Método interno para crear o recuperar un usuario.
     */
    public function crearObtenerUsuario($nombreRol, $email, $password)
    {
        $rol = Rol::firstOrCreate(['nombreRol' => $nombreRol]);
        $usuario = Usuario::where('email', $email)->first();

        if ($usuario) {
            if ($usuario->idRol !== $rol->idRol) {
                return response()->json(['error' => 'El usuario ya existe con otro rol.'], 400);
            }
            return $usuario;
        }

        return Usuario::create([
            'idRol' => $rol->idRol,
            'email' => $email,
            'password' => Hash::make($password),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/usuarios",
     *     tags={"Usuarios"},
     *     summary="Obtener todos los usuarios con sus roles",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista de usuarios con roles")
     * )
     */
    public function indexUsersWithRoles()
    {
        $usuarios = Usuario::with('rol:idRol,nombreRol')->get(['idUsuario', 'email', 'idRol']);
        return $this->sendResponse($usuarios, 'Lista de usuarios con roles obtenida exitosamente.');
    }

    /**
     * @OA\Get(
     *     path="/api/usuarios/{id}",
     *     tags={"Usuarios"},
     *     summary="Obtener usuario por ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Usuario encontrado"),
     *     @OA\Response(response=404, description="Usuario no encontrado")
     * )
     */
    public function show($idUsuario)
    {
        $usuario = Usuario::with('rol:idRol,nombreRol')->find($idUsuario);
        if (!$usuario) {
            return $this->sendError('Usuario no encontrado.', [], 404);
        }
        return $this->sendResponse($usuario, 'Usuario encontrado.');
    }

    /**
     * @OA\Put(
     *     path="/api/usuarios/{id}/rol",
     *     tags={"Usuarios"},
     *     summary="Actualizar rol de un usuario",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"idRol"},
     *             @OA\Property(property="idRol", type="integer", example=2)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Rol actualizado"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Usuario no encontrado")
     * )
     */
    public function updateRol(Request $request, $idUsuario)
    {
        $usuarioAutenticado = auth()->user()->load('rol');
        if (!$usuarioAutenticado->esSuperAdmin()) {
            return $this->sendError('No autorizado. Solo SuperAdmin puede actualizar roles de usuarios.', [], 403);
        }

        $usuario = Usuario::find($idUsuario);
        if (is_null($usuario)) {
            return $this->sendError('Usuario no encontrado.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'idRol' => 'required|exists:rol,idRol',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        if ($usuario->esSuperAdmin()) {
            if ($usuario->idUsuario === $usuarioAutenticado->idUsuario && $usuario->idRol !== $request->idRol) {
                return $this->sendError('Un SuperAdmin no puede cambiar su propio rol.', [], 403);
            }
            if ($usuario->idUsuario !== $usuarioAutenticado->idUsuario && $usuario->idRol !== $request->idRol) {
                return $this->sendError('No puedes cambiar el rol de otro SuperAdmin.', [], 403);
            }
        }

        $usuario->idRol = $request->input('idRol');
        $usuario->save();
        $usuario->load('rol:idRol,nombreRol');

        return $this->sendResponse($usuario, 'Rol de usuario actualizado exitosamente.');
    }

    /**
     * @OA\Delete(
     *     path="/api/usuarios/{id}",
     *     tags={"Usuarios"},
     *     summary="Eliminar usuario por ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Usuario eliminado"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Usuario no encontrado")
     * )
     */
    public function destroy($idUsuario)
    {
        $usuarioAutenticado = auth()->user()->load('rol');
        if (!$usuarioAutenticado->esSuperAdmin()) {
            return $this->sendError('No autorizado. Solo SuperAdmin puede eliminar usuarios.', [], 403);
        }

        $usuario = Usuario::find($idUsuario);
        if (!$usuario) {
            return $this->sendError('Usuario no encontrado.', [], 404);
        }

        if ($usuario->esSuperAdmin()) {
            $superAdminsCount = Usuario::whereHas('rol', function ($query) {
                $query->where('nombreRol', 'SuperAdmin');
            })->count();

            if ($superAdminsCount <= 1) {
                return $this->sendError('No se puede eliminar al último SuperAdmin del sistema.', [], 403);
            }
        }

        $usuario->delete();
        return $this->sendResponse([], 'Usuario eliminado exitosamente.');
    }
}
