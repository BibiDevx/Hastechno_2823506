<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; // Necesario para la validación manual

/**
 * @OA\Tag(
 * name="Roles",
 * description="Operaciones relacionadas con la gestión de roles de usuario."
 * )
 */
class rolController extends Controller
{
    /**
     * @OA\Get(
     * path="/api/control/roles",
     * summary="Obtener todos los roles",
     * tags={"Roles"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Lista de roles obtenida exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(
     * property="roles",
     * type="array",
     * @OA\Items(ref="#/components/schemas/Rol")
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
        $roles = Rol::all();
        return response()->json(['success' => true, 'roles' => $roles], 200);
    }

    /**
     * @OA\Get(
     * path="/api/control/roles/{id}",
     * summary="Buscar un rol por ID",
     * tags={"Roles"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del rol a buscar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Rol encontrado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="rol", ref="#/components/schemas/Rol")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Rol no encontrado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="Rol no encontrado")
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
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
     * path="/api/control/roles/registrar",
     * summary="Crear un nuevo rol (Solo SuperAdmin)",
     * tags={"Roles"},
     * security={{"bearerAuth": {}}},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para crear un nuevo rol.",
     * @OA\JsonContent(
     * required={"nombreRol"},
     * @OA\Property(property="nombreRol", type="string", maxLength=50, description="Nombre único del nuevo rol.", example="Editor")
     * )
     * ),
     * @OA\Response(
     * response=201,
     * description="Rol creado exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="rol", ref="#/components/schemas/Rol")
     * )
     * ),
     * @OA\Response(
     * response=403,
     * description="No autorizado. Solo SuperAdmin puede crear roles.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="No autorizado. Solo SuperAdmin puede crear roles.")
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
     * path="/api/control/roles/update/{id}",
     * summary="Actualizar un rol por completo (Solo SuperAdmin)",
     * tags={"Roles"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del rol a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar el rol.",
     * @OA\JsonContent(
     * required={"nombreRol"},
     * @OA\Property(property="nombreRol", type="string", maxLength=50, description="Nuevo nombre único del rol.", example="Editor Actualizado")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Rol actualizado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="rol", ref="#/components/schemas/Rol"),
     * @OA\Property(property="message", type="string", example="Rol actualizado correctamente")
     * )
     * ),
     * @OA\Response(
     * response=403,
     * description="No autorizado. Solo SuperAdmin puede actualizar roles.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="No autorizado. Solo SuperAdmin puede actualizar roles.")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Rol no encontrado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="Rol no encontrado")
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

        // 🚫 Bloquear cambios al SuperAdmin
        if (strtolower($rol->nombreRol) === 'superadmin') {
            return response()->json([
                'error' => 'No se puede modificar el rol SuperAdmin.'
            ], 403);
        }

        $validated = $request->validate([
            'nombreRol' => 'required|string|max:255|unique:rol,nombreRol,' . $idRol . ',idRol',
        ]);

        $rol->update($validated);

        return response()->json(['success' => true, 'message' => 'Rol actualizado correctamente'], 200);
    }

    /**
     * @OA\Patch(
     * path="/api/control/roles/actualizar/{id}",
     * summary="Actualizar parcialmente un rol (Solo SuperAdmin)",
     * tags={"Roles"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del rol a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar parcialmente el rol. Los campos son opcionales (sometimes).",
     * @OA\JsonContent(
     * @OA\Property(property="nombreRol", type="string", maxLength=50, description="Nuevo nombre único del rol.", example="Editor Parcial")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Rol actualizado parcialmente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="rol", ref="#/components/schemas/Rol"),
     * @OA\Property(property="message", type="string", example="Rol actualizado parcialmente")
     * )
     * ),
     * @OA\Response(
     * response=403,
     * description="No autorizado. Solo SuperAdmin puede actualizar roles.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="No autorizado. Solo SuperAdmin puede actualizar roles.")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Rol no encontrado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="Rol no encontrado")
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

        // 🚫 Bloquear cambios al SuperAdmin
        if (strtolower($rol->nombreRol) === 'superadmin') {
            return response()->json([
                'error' => 'No se puede modificar el rol SuperAdmin.'
            ], 403);
        }

        $validated = $request->validate([
            'nombreRol' => 'sometimes|string|max:255|unique:rol,nombreRol,' . $idRol . ',idRol',
        ]);

        $rol->update($validated);

        return response()->json(['success' => true, 'message' => 'Rol actualizado parcialmente'], 200);
    }

    /**
     * @OA\Delete(
     * path="/api/control/roles/eliminar/{id}",
     * summary="Eliminar un rol (Solo SuperAdmin)",
     * tags={"Roles"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del rol a eliminar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Rol eliminado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Rol eliminado correctamente")
     * )
     * ),
     * @OA\Response(
     * response=403,
     * description="No autorizado. Solo SuperAdmin puede eliminar roles.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="No autorizado. Solo SuperAdmin puede eliminar roles.")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Rol no encontrado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="Rol no encontrado")
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
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

        if (strtolower($rol->nombreRol) === 'superadmin') {
            return response()->json([
                'error' => 'No se puede eliminar el rol SuperAdmin.'
            ], 403);
        }

        $rol->delete();
        return response()->json(['success' => true, 'message' => 'Rol eliminado correctamente'], 200);
    }
}
