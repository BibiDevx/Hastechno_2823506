<?php
namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Rol;
use App\Models\Admin; // Si necesitas manejar eliminación de Admin/Cliente
use App\Models\Cliente; // Si necesitas manejar eliminación de Admin/Cliente
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class usuarioController extends BaseController // Asegúrate de extender tu BaseController
{
    // Método auxiliar para crear u obtener usuario (usado internamente, por ejemplo, por AuthController)
    // Se asume que este método YA ESTÁ siendo llamado por tus controladores de registro de Admin/Cliente.
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

    // 🔹 NUEVO MÉTODO: Obtener todos los usuarios con su rol para el componente UsuariosRolesAdmin
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

    // 🔹 Obtener un usuario por ID (con su rol)
    public function show($idUsuario)
    {
        $usuario = Usuario::with('rol:idRol,nombreRol')->find($idUsuario);
        if (!$usuario) {
            return $this->sendError('Usuario no encontrado.', [], 404);
        }
        return $this->sendResponse($usuario, 'Usuario encontrado.');
    }

    // 🔹 NUEVO MÉTODO: Actualizar el rol de un usuario específico
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
            if ($usuario->idUsuario !== $usuarioAutenticado->idUsuario && $usuario->idRol !== $request->idRol) {
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

    // 🔹 Eliminar un usuario genérico
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
