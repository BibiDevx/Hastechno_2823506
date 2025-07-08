<?php
namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Rol;
use App\Models\Admin; // Si necesitas manejar eliminación de Admin/Cliente
use App\Models\Cliente; // Si necesitas manejar eliminación de Admin/Cliente
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 * name="Usuarios",
 * description="Operaciones relacionadas con la gestión de usuarios y sus roles."
 * )
 *
 * @OA\Schema(
 * schema="UsuarioConRol",
 * title="Usuario con Rol",
 * description="Representa un usuario con la información de su rol asociada.",
 * allOf={
 * @OA\Schema(ref="#/components/schemas/Usuario"),
 * @OA\Schema(
 * @OA\Property(
 * property="rol",
 * ref="#/components/schemas/Rol",
 * description="Información del rol del usuario."
 * )
 * )
 * }
 * )
 */
class usuarioController extends BaseController // Asegúrate de extender tu BaseController
{
    // Método auxiliar para crear u obtener usuario (usado internamente, por ejemplo, por AuthController)
    // Se asume que este método YA ESTÁ siendo llamado por tus controladores de registro de Admin/Cliente.
    // No se documenta como un endpoint de API directo.
    public function crearObtenerUsuario($nombreRol, $email, $password)
    {
        $rol = Rol::firstOrCreate(['nombreRol' => $nombreRol]);

        $usuario = Usuario::where('email', $email)->first();

        if ($usuario) {
            // Si el usuario existe, se asume que no debe tener otro rol
            if ($usuario->idRol !== $rol->idRol) {
                // Aquí podrías lanzar una excepción o un error más específico si este es un escenario no deseado.
                // Por simplicidad, devolvemos un response()->json error si no extiende BaseController
                // Si este método es interno y siempre devuelve un objeto Usuario o null, puedes adaptar la respuesta.
                return response()->json(['error' => 'El usuario ya existe con otro rol.'], 400);
            }
            return $usuario;
        }

        $usuario = Usuario::create([
            'idRol' => $rol->idRol,
            'email' => $email,
            'password' => Hash::make($password),
        ]);

        return $usuario;
    }

    /**
     * @OA\Get(
     * path="/api/usuarios-con-roles",
     * summary="Obtener todos los usuarios con su rol",
     * tags={"Usuarios"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Lista de usuarios con roles obtenida exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Lista de usuarios con roles obtenida exitosamente."),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/UsuarioConRol")
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
    public function indexUsersWithRoles()
    {
        // Carga ansiosa la relación 'rol' para cada usuario
        // Seleccionamos las columnas necesarias de 'usuario' y de 'rol'
        $usuarios = Usuario::with('rol:idRol,nombreRol')->get([
            'idUsuario', 'email', 'idRol' // Incluye idRol para preseleccionar en el frontend
            // Agrega aquí cualquier otra columna que necesites del modelo Usuario para mostrar
        ]);

        return $this->sendResponse($usuarios, 'Lista de usuarios con roles obtenida exitosamente.');
    }

    /**
     * @OA\Get(
     * path="/api/usuarios/{idUsuario}",
     * summary="Obtener un usuario por ID con su rol",
     * tags={"Usuarios"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del usuario a obtener.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Usuario encontrado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Usuario encontrado."),
     * @OA\Property(property="data", ref="#/components/schemas/UsuarioConRol")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Usuario no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
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
     * @OA\Patch(
     * path="/api//usuarios/{idUsuario}/actualizar-rol",
     * summary="Actualizar el rol de un usuario específico (solo SuperAdmin)",
     * tags={"Usuarios"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del usuario cuyo rol se va a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar el rol del usuario.",
     * @OA\JsonContent(
     * required={"idRol"},
     * @OA\Property(property="idRol", type="integer", format="int64", description="El nuevo ID del rol para el usuario. Debe existir en la tabla 'rol'.", example=2)
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Rol de usuario actualizado exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Rol de usuario actualizado exitosamente."),
     * @OA\Property(property="data", ref="#/components/schemas/UsuarioConRol")
     * )
     * ),
     * @OA\Response(
     * response=403,
     * description="No autorizado (solo SuperAdmin puede actualizar roles o reglas de seguridad de SuperAdmin).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=404,
     * description="Usuario no encontrado.",
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
    public function updateRol(Request $request, $idUsuario)
    {
        // Verificar que el usuario autenticado sea SuperAdmin
        $usuarioAutenticado = auth()->user()->load('rol');
        if (!$usuarioAutenticado->esSuperAdmin()) {
            return $this->sendError('No autorizado. Solo SuperAdmin puede actualizar roles de usuarios.', [], 403);
        }

        $usuario = Usuario::find($idUsuario);
        if (is_null($usuario)) {
            return $this->sendError('Usuario no encontrado.', [], 404);
        }

        // Validar que el nuevo idRol sea requerido y exista en la tabla 'rol'
        $validator = Validator::make($request->all(), [
            'idRol' => 'required|exists:rol,idRol',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }
        
        // Reglas de seguridad para SuperAdmin
        if ($usuario->esSuperAdmin()) {
            // Si el SuperAdmin autenticado intenta cambiar su propio rol a algo que no sea SuperAdmin
            if ($usuario->idUsuario === $usuarioAutenticado->idUsuario && $usuario->idRol !== $request->idRol) {
                return $this->sendError('Un SuperAdmin no puede cambiar su propio rol.', [], 403);
            }
            // Si el SuperAdmin autenticado intenta cambiar el rol de otro SuperAdmin a algo que no sea SuperAdmin
            // Esta regla parece un poco redundante o restrictiva si el objetivo es cambiar a otro rol,
            // pero la mantengo según tu lógica de negocio.
            if ($usuario->idUsuario !== $usuarioAutenticado->idUsuario && $usuario->idRol !== $request->idRol) {
                // Aquí la lógica es que si el usuario a editar es SuperAdmin, y su idRol no es el mismo que el nuevo idRol,
                // entonces no se permite. Esto significa que un SuperAdmin no puede cambiar el rol de otro SuperAdmin.
                return $this->sendError('No puedes cambiar el rol de otro SuperAdmin.', [], 403);
            }
        }
        
        // Actualizar el idRol del usuario
        $usuario->idRol = $request->input('idRol');
        $usuario->save();

        // Recargar el usuario con su nuevo rol para la respuesta del frontend
        $usuario->load('rol:idRol,nombreRol');

        return $this->sendResponse($usuario, 'Rol de usuario actualizado exitosamente.');
    }

    /**
     * @OA\Delete(
     * path="/api/usuarios/{idUsuario}",
     * summary="Eliminar un usuario genérico (solo SuperAdmin)",
     * tags={"Usuarios"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del usuario a eliminar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Usuario eliminado exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Usuario eliminado exitosamente."),
     * @OA\Property(property="data", type="array",* @OA\Items(type="object"), example={})
     * )
     * ),
     * @OA\Response(
     * response=403,
     * description="No autorizado (solo SuperAdmin puede eliminar usuarios o no se puede eliminar al último SuperAdmin).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=404,
     * description="Usuario no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function destroy($idUsuario)
    {
        // Verificar que el usuario autenticado sea SuperAdmin
        $usuarioAutenticado = auth()->user()->load('rol');
        if (!$usuarioAutenticado->esSuperAdmin()) {
            return $this->sendError('No autorizado. Solo SuperAdmin puede eliminar usuarios.', [], 403);
        }

        $usuario = Usuario::find($idUsuario);
        if (!$usuario) {
            return $this->sendError('Usuario no encontrado.', [], 404);
        }

        // Prevenir la eliminación del último SuperAdmin
        if ($usuario->esSuperAdmin()) {
            $superAdminsCount = Usuario::whereHas('rol', function ($query) {
                $query->where('nombreRol', 'SuperAdmin');
            })->count();

            if ($superAdminsCount <= 1) {
                return $this->sendError('No se puede eliminar al último SuperAdmin del sistema.', [], 403);
            }
        }
        
        // Considera si este usuario es un Admin o un Cliente
        // Y si necesitas eliminar sus registros asociados antes de eliminar el Usuario.
        // Por ejemplo, para eliminar en cascada (si no lo manejas a nivel de BD):
        // if ($usuario->admin) { $usuario->admin->delete(); }
        // if ($usuario->cliente) { $usuario->cliente->delete(); }

        $usuario->delete();
        return $this->sendResponse([], 'Usuario eliminado exitosamente.');
    }
}
