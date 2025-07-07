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
        $admins = Admin::all();
        return $this->sendResponse($admins, 'Lista de admins obtenida exitosamente.');
    }

    // 🔹 Obtener un admin por ID
    public function show($id)
    {
        $admin = Admin::find($id);
        if (!$admin) {
            return $this->sendError('admin no encontrado.', [], 404);
        }
        return $this->sendResponse($admin, 'admin encontrado.');
    }

    // 🔹 Actualizar parcialmente un admin
    public function updatePartial(Request $request)
    {
        $usuario = auth()->user(); // Usuario autenticado
        $admin = $usuario->admin; // Relación: usuario -> admin

        if (!$admin) {
            return $this->sendError('Admin no encontrado.', [], 404);
        }

        // Validaciones solo para los campos enviados
        $validator = Validator::make($request->all(), [
            'nombreAdmin' => 'sometimes|string|max:255',
            'apellidoAdmin' => 'sometimes|string|max:255',
            'cedulaAdmin' => 'sometimes|numeric|unique:admin,cedulaAdmin,' . $admin->idAdmin . ',idAdmin',
            'telefonoAdmin' => 'sometimes|numeric',
            'email' => 'sometimes|email|max:255|unique:usuario,email,' . $usuario->idUsuario . ',idUsuario',
            'password' => 'sometimes|string|min:6',
            'idRol' => 'sometimes|exists:rol,idRol', // Solo SuperAdmin puede cambiar esto
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        // Datos del admin
        $input = $request->only([
            'nombreAdmin',
            'apellidoAdmin',
            'cedulaAdmin',
            'telefonoAdmin'
        ]);

        // Datos del usuario
        $inputUsuario = [];

        if ($request->has('email')) {
            $inputUsuario['email'] = $request->email;
        }

        if ($request->has('password')) {
            $inputUsuario['password'] = Hash::make($request->password);
        }

        // Si el usuario es SuperAdmin, puede cambiar el rol
        if ($usuario->rol->nombreRol === 'SuperAdmin' && $request->has('idRol')) {
            $inputUsuario['idRol'] = $request->idRol;
        }

        // Guardar cambios
        $admin->update($input);

        if (!empty($inputUsuario)) {
            $usuario->update($inputUsuario);
        }

        return $this->sendResponse($admin, 'Administrador actualizado correctamente.');
    }

    // 🔹 Eliminar un admin
    public function destroy($id)
    {
        $usuario = auth()->user();

        // Solo SuperAdmin puede eliminar
        if ($usuario->rol->nombreRol !== 'SuperAdmin') {
            return $this->sendError('No autorizado. Solo SuperAdmin puede eliminar administradores.', [], 403);
        }

        $admin = Admin::find($id);
        if (!$admin) {
            return $this->sendError('Administrador no encontrado.', [], 404);
        }

        // Obtener el usuario relacionado
        $usuarioRelacionado = $admin->usuario;

        // Eliminar primero el admin
        $admin->delete();

        // Luego eliminar el usuario relacionado si existe
        if ($usuarioRelacionado) {
            $usuarioRelacionado->delete();
        }

        return $this->sendResponse([], 'Administrador y su usuario fueron eliminados correctamente.');
    }
    public function actualizarAdmins(Request $request, $id)
    {
        // Obtener el admin a actualizar
        $admin = Admin::find($id);
        if (!$admin) {
            return $this->sendError('Admin no encontrado.', [], 404);
        }

        // Obtener el usuario autenticado
        $usuario = auth()->user();

        // Validaciones solo para los campos enviados
        $validator = Validator::make($request->all(), [
            'nombreAdmin' => 'sometimes|string|max:255',
            'apellidoAdmin' => 'sometimes|string|max:255',
            'cedulaAdmin' => 'sometimes|numeric|unique:admin,cedulaAdmin,' . $id . ',idAdmin',
            'telefonoAdmin' => 'sometimes|numeric',
            'email' => 'sometimes|email|max:255|unique:usuario,email,' . $admin->idUsuario . ',idUsuario',
            'password' => 'sometimes|string|min:6',
            'idRol' => 'sometimes|exists:rol,idRol', // Solo SuperAdmin puede cambiar esto
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        // Obtener los campos que se enviaron
        $input = $request->only([
            'nombreAdmin',
            'apellidoAdmin',
            'cedulaAdmin',
            'telefonoAdmin'
        ]);

        // Si enviaron clave, cifrarla
        if ($request->has('password')) {
            $inputUsuario['password'] = Hash::make($request->password);
        }

        // Si enviaron email, actualizar en usuario
        if ($request->has('email')) {
            $inputUsuario['email'] = $request->email;
        }

        // Si el usuario autenticado es SuperAdmin, permitir actualizar el rol
        if ($usuario->rol->nombreRol === 'SuperAdmin' && $request->has('idRol')) {
            $inputUsuario['idRol'] = $request->idRol;
        }

        // Actualizar la información en la tabla `admin`
        $admin->update($input);

        // Actualizar la información en la tabla `usuario`
        if (!empty($inputUsuario)) {
            $admin->usuario()->update($inputUsuario);
        }

        return $this->sendResponse($admin, 'Admin actualizado correctamente.');
    }


}
