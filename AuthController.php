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

class AuthController extends BaseController
{
    //constructor usuarioController
    protected $usuarioController;
    public function __construct(UsuarioController $usuarioController)
    {
        $this->usuarioController = $usuarioController;
    }
    //registro Cliente
    public function registerCliente(Request $request)
    {
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'nombreCliente' => 'required|string|max:255',
            'apellidoCliente' => 'required|string|max:255',
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
        // $cliente = Cliente::create($input);
        return response()->json(['message' => 'Cliente registrado exitosamente', 'cliente' => $cliente], 201);
    }
    //registro  Admin
    public function registerAdmin(Request $request)
    {
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'nombreAdmin' => 'required|string|max:255',
            'apellidoAdmin' => 'required|string|max:255',
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
        // $cliente = Cliente::create($input);
        return response()->json(['message' => 'Admin registrado exitosamente', 'admin' => $admin], 201);
    }
    // 🔹 Login
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

    // 🔹 Perfil
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



    // 🔹 Logout
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return $this->sendResponse([], 'User logout successfully');
        } catch (\Exception $e) {
            return $this->sendError('Unauthorized', ['error' => 'No se pudo cerrar sesión, token inválido'], 401);
        }
    }

    // 🔹 Refresh Token
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
