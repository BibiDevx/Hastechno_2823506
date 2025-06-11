<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class adminController extends BaseController
{
    // 🔹 Obtener todos los admins
    public function index()
    {
        // Carga ansiosa (eager loading) de la relación 'usuario',
        // seleccionando solo las columnas 'idUsuario' y 'email'.
        $admins = Admin::with('usuario:idUsuario,email')->get();
        return $this->sendResponse($admins, 'Lista de admins obtenida exitosamente.');
    }

    // 🔹 Obtener un admin por ID
    public function show($id)
    {
        // Carga ansiosa de la relación 'usuario' también para una búsqueda individual.
        $admin = Admin::with('usuario:idUsuario,email')->find($id);
        if (!$admin) {
            return $this->sendError('Admin no encontrado.', [], 404);
        }
        return $this->sendResponse($admin, 'Admin encontrado.');
    }

    // 🔹 Actualizar parcialmente un admin (para el propio admin autenticado)
    public function updatePartial(Request $request)
    {
        $usuario = auth()->user(); // Usuario autenticado
        $admin = $usuario->admin; // Relación: usuario -> admin

        if (!$admin) {
            return $this->sendError('Admin no encontrado.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombreAdmin' => 'sometimes|string|max:255',
            'apellidoAdmin' => 'sometimes|string|max:255',
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

    // 🔹 Eliminar un admin
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

    // 🔹 Actualizar administradores por SuperAdmin (ruta /users/actualizar/admin/{id})
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