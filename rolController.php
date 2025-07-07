<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use Illuminate\Http\Request;

class rolController extends Controller
{
    // Obtener todos los roles
    public function index()
    {
        $roles = Rol::all();
        return response()->json(['success' => true, 'roles' => $roles], 200);
    }

    // Buscar un rol por ID
    public function show($idRol)
    {
        $rol = Rol::find($idRol);
        if (!$rol) {
            return response()->json(['error' => 'Rol no encontrado'], 404);
        }
        return response()->json(['success' => true, 'rol' => $rol], 200);
    }

    // Crear un nuevo rol (Solo SuperAdmin)
    public function store(Request $request)
    {
        $usuario = auth()->user();
        if ($usuario->rol->nombreRol !== 'SuperAdmin') {
            return response()->json(['error' => 'No autorizado. Solo SuperAdmin puede crear roles.'], 403);
        }

        $request->validate([
            'nombreRol' => 'required|string|unique:rol,nombreRol|max:50',
        ]);

        $rol = Rol::create([
            'nombreRol' => $request->nombreRol
        ]);

        return response()->json(['success' => true, 'rol' => $rol], 201);
    }

    // Actualizar un rol por completo (PUT) (Solo SuperAdmin)
    public function update(Request $request, $idRol)
    {
        $usuario = auth()->user();
        if ($usuario->rol->nombreRol !== 'SuperAdmin') {
            return response()->json(['error' => 'No autorizado. Solo SuperAdmin puede actualizar roles.'], 403);
        }

        $rol = Rol::find($idRol);
        if (!$rol) {
            return response()->json(['error' => 'Rol no encontrado'], 404);
        }

        $request->validate([
            'nombreRol' => 'required|string|unique:rol,nombreRol,' . $idRol . ',idRol|max:50',
        ]);

        $rol->nombreRol = $request->nombreRol;
        $rol->save();

        return response()->json([
            'success' => true,
            'rol' => $rol,
            'message' => 'Rol actualizado correctamente'
        ], 200);
    }

    // Actualizar parcialmente un rol (PATCH) (Solo SuperAdmin)
    public function updatePartial(Request $request, $idRol)
    {
        $usuario = auth()->user();
        if ($usuario->rol->nombreRol !== 'SuperAdmin') {
            return response()->json(['error' => 'No autorizado. Solo SuperAdmin puede actualizar roles.'], 403);
        }

        $rol = Rol::find($idRol);
        if (!$rol) {
            return response()->json(['error' => 'Rol no encontrado'], 404);
        }

        $request->validate([
            'nombreRol' => 'sometimes|string|unique:rol,nombreRol,' . $idRol . ',idRol|max:50',
        ]);

        if ($request->has('nombreRol')) {
            $rol->nombreRol = $request->nombreRol;
        }

        $rol->save();

        return response()->json([
            'success' => true,
            'rol' => $rol,
            'message' => 'Rol actualizado parcialmente'
        ], 200);
    }

    // Eliminar un rol (Solo SuperAdmin)
    public function destroy($idRol)
    {
        $usuario = auth()->user();
        if ($usuario->rol->nombreRol !== 'SuperAdmin') {
            return response()->json(['error' => 'No autorizado. Solo SuperAdmin puede eliminar roles.'], 403);
        }

        $rol = Rol::find($idRol);
        if (!$rol) {
            return response()->json(['error' => 'Rol no encontrado'], 404);
        }

        $rol->delete();
        return response()->json(['success' => true, 'message' => 'Rol eliminado correctamente'], 200);
    }
}
