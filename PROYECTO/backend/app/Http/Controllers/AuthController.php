<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Cliente;
use App\Models\Admin;
use App\Http\Controllers\UsuarioController;
use Illuminate\Http\Request;
use App\Http\Controllers\BaseController as BaseController;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * @OA\Tag(
 * name="Autenticación",
 * description="Operaciones de registro, inicio de sesión y gestión de sesión de usuarios."
 * )
 *
 * @OA\Schema(
 * schema="RegisterClientInput",
 * title="Datos de Registro de Cliente",
 * description="Datos requeridos para registrar un nuevo cliente.",
 * required={"nombreCliente", "apellidoCliente", "cedulaCliente", "email", "password", "c_password", "telefonoCliente", "direccion"},
 * @OA\Property(property="nombreCliente", type="string", maxLength=255, example="Juan", description="Nombre del cliente."),
 * @OA\Property(property="apellidoCliente", type="string", maxLength=255, example="Pérez", description="Apellido del cliente."),
 * @OA\Property(property="cedulaCliente", type="string", example="1234567890", description="Cédula de identidad del cliente (debe ser única)."),
 * @OA\Property(property="email", type="string", format="email", maxLength=255, example="juan.perez@example.com", description="Correo electrónico único del usuario."),
 * @OA\Property(property="password", type="string", minLength=6, example="password123", description="Contraseña del usuario (mínimo 6 caracteres)."),
 * @OA\Property(property="c_password", type="string", minLength=6, example="password123", description="Confirmación de la contraseña (debe coincidir con 'password')."),
 * @OA\Property(property="telefonoCliente", type="string", pattern="^[0-9]{10}$", example="3001234567", description="Número de teléfono del cliente (10 dígitos numéricos)."),
 * @OA\Property(property="direccion", type="string", maxLength=255, example="Calle 1 # 2-3, Ciudad", description="Dirección del cliente.")
 * )
 *
 * @OA\Schema(
 * schema="RegisterAdminInput",
 * title="Datos de Registro de Administrador",
 * description="Datos requeridos para registrar un nuevo administrador.",
 * required={"nombreAdmin", "apellidoAdmin", "cedulaAdmin", "email", "password", "c_password", "telefonoAdmin"},
 * @OA\Property(property="nombreAdmin", type="string", maxLength=255, example="Ana", description="Nombre del administrador."),
 * @OA\Property(property="apellidoAdmin", type="string", maxLength=255, example="Gómez", description="Apellido del administrador."),
 * @OA\Property(property="cedulaAdmin", type="string", example="0987654321", description="Cédula de identidad del administrador (debe ser única)."),
 * @OA\Property(property="email", type="string", format="email", maxLength=255, example="ana.gomez@example.com", description="Correo electrónico único del usuario."),
 * @OA\Property(property="password", type="string", minLength=6, example="password123", description="Contraseña del usuario (mínimo 6 caracteres)."),
 * @OA\Property(property="c_password", type="string", minLength=6, example="password123", description="Confirmación de la contraseña (debe coincidir con 'password')."),
 * @OA\Property(property="telefonoAdmin", type="string", pattern="^[0-9]{10}$", example="3109876543", description="Número de teléfono del administrador (10 dígitos numéricos).")
 * )
 *
 * @OA\Schema(
 * schema="LoginInput",
 * title="Credenciales de Inicio de Sesión",
 * description="Correo electrónico y contraseña para iniciar sesión.",
 * required={"email", "password"},
 * @OA\Property(property="email", type="string", format="email", example="usuario@example.com", description="Correo electrónico del usuario."),
 * @OA\Property(property="password", type="string", format="password", example="password123", description="Contraseña del usuario.")
 * )
 *
 * @OA\Schema(
 * schema="LoginSuccessResponse",
 * title="Respuesta de Login Exitoso",
 * description="Datos devueltos al iniciar sesión exitosamente.",
 * @OA\Property(property="success", type="boolean", example=true, description="Indica si la operación fue exitosa."),
 * @OA\Property(property="message", type="string", example="Usuario autenticado correctamente.", description="Mensaje de éxito."),
 * @OA\Property(
 * property="data",
 * type="object",
 * @OA\Property(property="access_token", type="string", description="Token de acceso JWT."),
 * @OA\Property(property="token_type", type="string", example="bearer", description="Tipo de token."),
 * @OA\Property(property="expires_in", type="integer", description="Tiempo de expiración del token en segundos."),
 * @OA\Property(
 * property="user",
 * type="object",
 * @OA\Property(property="id", type="integer", format="int64", example=1, description="ID del usuario."),
 * @OA\Property(property="nombre", type="string", example="Juan", description="Nombre del cliente o administrador."),
 * @OA\Property(property="email", type="string", format="email", example="juan.perez@example.com", description="Correo electrónico del usuario."),
 * @OA\Property(property="rol", type="string", example="Cliente", description="Rol del usuario.")
 * )
 * )
 * )
 *
 * @OA\Schema(
 * schema="UserProfileResponse",
 * title="Perfil de Usuario Autenticado",
 * description="Información completa del usuario autenticado, incluyendo sus relaciones de rol, cliente y/o administrador.",
 * allOf={
 * @OA\Schema(ref="#/components/schemas/Usuario"),
 * @OA\Schema(
 * @OA\Property(property="rol", ref="#/components/schemas/Rol", description="Objeto del rol del usuario."),
 * @OA\Property(property="cliente", ref="#/components/schemas/Cliente", description="Objeto del perfil de cliente (si aplica).", nullable=true),
 * @OA\Property(property="admin", ref="#/components/schemas/Admin", description="Objeto del perfil de administrador (si aplica).", nullable=true)
 * )
 * }
 * )
 *
 * @OA\Schema(
 * schema="TokenRefreshResponse",
 * title="Respuesta de Refresco de Token",
 * description="Datos devueltos al refrescar un token JWT.",
 * @OA\Property(property="success", type="boolean", example=true, description="Indica si la operación fue exitosa."),
 * @OA\Property(property="message", type="string", example="Token refreshed successfully", description="Mensaje de éxito."),
 * @OA\Property(
 * property="data",
 * type="object",
 * @OA\Property(property="access_token", type="string", description="Nuevo token de acceso JWT."),
 * @OA\Property(property="token_type", type="string", example="bearer", description="Tipo de token."),
 * @OA\Property(property="expires_in", type="integer", description="Tiempo de expiración del nuevo token en segundos.")
 * )
 * )
 */
class AuthController extends BaseController
{
    //constructor usuarioController
    protected $usuarioController;
    public function __construct(UsuarioController $usuarioController)
    {
        $this->usuarioController = $usuarioController;
    }

    /**
     * @OA\Post(
     * path="/api/auth/register/cliente",
     * summary="Registrar un nuevo cliente",
     * tags={"Autenticación"},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para el registro del cliente.",
     * @OA\JsonContent(ref="#/components/schemas/RegisterClientInput")
     * ),
     * @OA\Response(
     * response=201,
     * description="Cliente registrado exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Cliente registrado exitosamente"),
     * @OA\Property(property="cliente", ref="#/components/schemas/Cliente")
     * )
     * ),
     * @OA\Response(
     * response=400,
     * description="Errores de validación o usuario ya existente con otro rol.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="object", example={"email": {"El campo email ya ha sido tomado."}})
     * )
     * ),
     * @OA\Response(
     * response=500,
     * description="Error interno del servidor al crear el usuario.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="No se pudo crear el usuario")
     * )
     * )
     * )
     */
    public function registerCliente(Request $request)
    {
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'nombreCliente' => 'required|string|max:255|regex:/^[\pL\s\-]+$/u',
            'apellidoCliente' => 'required|string|max:255|regex:/^[\pL\s\-]+$/u',
            'cedulaCliente' => 'required|numeric|unique:cliente,cedulaCliente',
            'email' => 'required|string|email|max:255|unique:usuario,email',
            'password' => 'required|string|min:6',
            'c_password' => 'required|string|min:6|same:password',
            'telefonoCliente' => 'required|numeric|digits:10',
            'direccion' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // 🔹 Llamar a UsuarioController para crear o recuperar usuario
        $usuario = $this->usuarioController->crearObtenerUsuario('Cliente', $request->email, $request->password);


        if (!$usuario) {
            return response()->json(['error' => 'No se pudo crear el usuario'], 500);
        }

        // 🔹 Registrar Cliente con el usuario creado
        $cliente = Cliente::create([
            'idUsuario' => $usuario->idUsuario,
            'nombreCliente' => $request->nombreCliente,
            'apellidoCliente' => $request->apellidoCliente,
            'cedulaCliente' => $request->cedulaCliente,
            'telefonoCliente' => $request->telefonoCliente,
            'direccion' => $request->direccion,
        ]);
        return response()->json(['success' => true, 'message' => 'Cliente registrado exitosamente', 'cliente' => $cliente], 201);
    }

    /**
     * @OA\Post(
     * path="/api/auth/register/admin",
     * summary="Registrar un nuevo administrador",
     * tags={"Autenticación"},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para el registro del administrador.",
     * @OA\JsonContent(ref="#/components/schemas/RegisterAdminInput")
     * ),
     * @OA\Response(
     * response=201,
     * description="Administrador registrado exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="message", type="string", example="Admin registrado exitosamente"),
     * @OA\Property(property="admin", ref="#/components/schemas/Admin")
     * )
     * ),
     * @OA\Response(
     * response=400,
     * description="Errores de validación o usuario ya existente con otro rol.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="object", example={"email": {"El campo email ya ha sido tomado."}})
     * )
     * ),
     * @OA\Response(
     * response=500,
     * description="Error interno del servidor al crear el usuario.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="No se pudo crear el usuario")
     * )
     * )
     * )
     */
    public function registerAdmin(Request $request)
    {
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'nombreAdmin' => 'required|string|max:255|regex:/^[\pL\s\-]+$/u',
            'apellidoAdmin' => 'required|string|max:255|regex:/^[\pL\s\-]+$/u',
            'cedulaAdmin' => 'required|numeric|unique:admin,cedulaAdmin',
            'email' => 'required|string|email|max:255|unique:usuario,email',
            'password' => 'required|string|min:6',
            'c_password' => 'required|string|min:6|same:password',
            'telefonoAdmin' => 'required|numeric|digits:10'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // 🔹 Llamar a UsuarioController para crear o recuperar usuario
        $usuario = $this->usuarioController->crearObtenerUsuario('Admin', $request->email, $request->password);

        if (!$usuario) {
            return response()->json(['error' => 'No se pudo crear el usuario'], 500);
        }

        // 🔹 Registrar admin con el usuario creado
        $admin = Admin::create([
            'idUsuario' => $usuario->idUsuario,
            'nombreAdmin' => $request->nombreAdmin,
            'apellidoAdmin' => $request->apellidoAdmin,
            'cedulaAdmin' => $request->cedulaAdmin,
            'telefonoAdmin' => $request->telefonoAdmin
        ]);
        return response()->json(['message' => 'Admin registrado exitosamente', 'admin' => $admin], 201);
    }

    /**
     * @OA\Post(
     * path="/api/auth/login",
     * summary="Iniciar sesión de usuario",
     * tags={"Autenticación"},
     * @OA\RequestBody(
     * required=true,
     * description="Credenciales de usuario (email y password).",
     * @OA\JsonContent(ref="#/components/schemas/LoginInput")
     * ),
     * @OA\Response(
     * response=200,
     * description="Usuario autenticado correctamente.",
     * @OA\JsonContent(ref="#/components/schemas/LoginSuccessResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado (usuario no encontrado o credenciales incorrectas).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        $user = Usuario::where('email', $request->email)->first();
        if (!$user) {
            return $this->sendError('Unauthorized', ['error' => 'Usuario no encontrado'], 401);
        }

        if (!$token = auth('api')->attempt($credentials)) {
            return $this->sendError('Unauthorized', ['error' => 'Credenciales incorrectas'], 401);
        }

        // Obtener el rol del usuario
        $rol = $user->rol ? $user->rol->nombreRol : 'Sin rol';

        return $this->sendResponse([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'user' => [
                'id' => $user->idUsuario,
                'nombre' => $user->cliente->nombreCliente ?? $user->admin->nombreAdmin ?? 'Usuario',
                'email' => $user->email,
                'rol' => $rol,
            ]
        ], 'Usuario autenticado correctamente.');
    }

    /**
     * @OA\Get(
     * path="/api/auth/profile",
     * summary="Obtener el perfil del usuario autenticado",
     * tags={"Autenticación"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Perfil del usuario autenticado obtenido exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="data", ref="#/components/schemas/UserProfileResponse")
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado (token inválido o ausente).",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="error", type="string", example="No autorizado")
     * )
     * )
     * )
     */
    public function profile()
    {
        try {
            // Autenticar usuario
            $user = JWTAuth::parseToken()->authenticate();

            // Cargar relaciones (rol, cliente, admin)
            $user->load(['rol', 'cliente', 'admin']);

            return response()->json([
                'success' => true,
                'data' => $user,
            ], 200);

        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'No autorizado'], 401);
        }
    }

    /**
     * @OA\Post(
     * path="/api/auth/logout",
     * summary="Cerrar sesión del usuario (invalidar token)",
     * tags={"Autenticación"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Sesión cerrada exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(type="object"),
     * example={}
     * ),
     * @OA\Property(property="message", type="string", example="User logout successfully")
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado (token inválido o ausente).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return $this->sendResponse([], 'User logout successfully');
        } catch (\Exception $e) {
            return $this->sendError('Unauthorized', ['error' => 'No se pudo cerrar sesión, token inválido'], 401);
        }
    }

    /**
     * @OA\Post(
     * path="/api/auth/refresh",
     * summary="Refrescar token JWT",
     * tags={"Autenticación"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Token refrescado exitosamente.",
     * @OA\JsonContent(ref="#/components/schemas/TokenRefreshResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autorizado (token inválido o ausente).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function refresh()
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());
            return $this->sendResponse($this->respondWithToken($token), 'Token refreshed successfully');
        } catch (\Exception $e) {
            return $this->sendError('Unauthorized', ['error' => 'No se pudo refrescar el token'], 401);
        }
    }

    protected function respondWithToken($token)
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
        ];
    }
}
