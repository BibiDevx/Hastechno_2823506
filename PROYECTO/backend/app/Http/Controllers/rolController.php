<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Roles",
 *     description="Gestión de roles (solo SuperAdmin puede modificar)"
 * )
 */
class rolController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/roles",
     *     summary="Obtener todos los roles",
     *     tags={"Roles"},
     *     @OA\Response(response=200, description="Lista de roles obtenida correctamente")
     * )
     */
    public function index()
    {
        $roles = Rol::all();
        return response()->json(['success' => true, 'roles' => $roles], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/roles/{idRol}",
     *     summary="Obtener un rol por ID",
     *     tags={"Roles"},
     *     @OA\Parameter(
     *         name="idRol",
     *         in="path",
     *         required=true,
     *         description="ID del rol",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Rol obtenido correctamente"),
     *     @OA\Response(response=404, description="Rol no encontrado")
     * )
     */
    public function show($idRol)
    {
        $rol = Rol::find($idRol);
        if (!$rol) {
            return response()->json(['error' => 'Rol no encontrado'], 404);
        }
        return response()->json(['success' => true, 'rol' => $rol], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/roles",
     *     summary="Crear un nuevo rol (solo SuperAdmin)",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombreRol"},
     *             @OA\Property(property="nombreRol", type="string", example="Moderador")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Rol creado correctamente"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
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

    /**
     * @OA\Put(
     *     path="/api/roles/{idRol}",
     *     summary="Actualizar completamente un rol (solo SuperAdmin)",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="idRol",
     *         in="path",
     *         required=true,
     *         description="ID del rol",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombreRol"},
     *             @OA\Property(property="nombreRol", type="string", example="Administrador")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Rol actualizado correctamente"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Rol no encontrado"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
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

    /**
     * @OA\Patch(
     *     path="/api/roles/{idRol}",
     *     summary="Actualizar parcialmente un rol (solo SuperAdmin)",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="idRol",
     *         in="path",
     *         required=true,
     *         description="ID del rol",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="nombreRol", type="string", example="Editor")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Rol actualizado parcialmente"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Rol no encontrado"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
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

    /**
     * @OA\Delete(
     *     path="/api/roles/{idRol}",
     *     summary="Eliminar un rol (solo SuperAdmin)",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="idRol",
     *         in="path",
     *         required=true,
     *         description="ID del rol",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Rol eliminado correctamente"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Rol no encontrado")
     * )
     */
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
