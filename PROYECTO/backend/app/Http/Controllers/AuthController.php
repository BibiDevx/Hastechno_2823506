<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Cliente;
use App\Models\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\BaseController as BaseController;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends BaseController
{
    protected $usuarioController;

    public function __construct(UsuarioController $usuarioController)
    {
        $this->usuarioController = $usuarioController;
    }

    /**
     * @OA\Post(
     *     path="/api/auth/register-cliente",
     *     summary="Registrar nuevo cliente",
     *     tags={"Autenticación"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombreCliente","apellidoCliente","cedulaCliente","email","password","c_password","telefonoCliente","direccion"},
     *             @OA\Property(property="nombreCliente", type="string", example="Juan"),
     *             @OA\Property(property="apellidoCliente", type="string", example="Pérez"),
     *             @OA\Property(property="cedulaCliente", type="string", example="1234567890"),
     *             @OA\Property(property="email", type="string", format="email", example="juan@example.com"),
     *             @OA\Property(property="password", type="string", example="123456"),
     *             @OA\Property(property="c_password", type="string", example="123456"),
     *             @OA\Property(property="telefonoCliente", type="string", example="3101234567"),
     *             @OA\Property(property="direccion", type="string", example="Calle 123 #45-67")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Cliente registrado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Datos inválidos"
     *     )
     * )
     */
    public function registerCliente(Request $request)
    {
        // ...
    }

    /**
     * @OA\Post(
     *     path="/api/auth/register-admin",
     *     summary="Registrar nuevo administrador",
     *     tags={"Autenticación"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombreAdmin","apellidoAdmin","cedulaAdmin","email","password","c_password","telefonoAdmin"},
     *             @OA\Property(property="nombreAdmin", type="string", example="Ana"),
     *             @OA\Property(property="apellidoAdmin", type="string", example="Gómez"),
     *             @OA\Property(property="cedulaAdmin", type="string", example="9876543210"),
     *             @OA\Property(property="email", type="string", format="email", example="ana@example.com"),
     *             @OA\Property(property="password", type="string", example="admin123"),
     *             @OA\Property(property="c_password", type="string", example="admin123"),
     *             @OA\Property(property="telefonoAdmin", type="string", example="3127654321")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Admin registrado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Datos inválidos"
     *     )
     * )
     */
    public function registerAdmin(Request $request)
    {
        // ...
    }

    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     summary="Iniciar sesión",
     *     tags={"Autenticación"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@example.com"),
     *             @OA\Property(property="password", type="string", example="123456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario autenticado correctamente"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciales incorrectas"
     *     )
     * )
     */
    public function login(Request $request)
    {
        // ...
    }

    /**
     * @OA\Get(
     *     path="/api/auth/profile",
     *     summary="Obtener perfil del usuario autenticado",
     *     tags={"Autenticación"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Datos del usuario autenticado"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Token inválido o no enviado"
     *     )
     * )
     */
    public function profile()
    {
        // ...
    }

    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     summary="Cerrar sesión",
     *     tags={"Autenticación"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Sesión cerrada correctamente"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Token inválido"
     *     )
     * )
     */
    public function logout()
    {
        // ...
    }

    /**
     * @OA\Post(
     *     path="/api/auth/refresh",
     *     summary="Refrescar token JWT",
     *     tags={"Autenticación"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token refrescado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Token inválido o no enviado"
     *     )
     * )
     */
    public function refresh()
    {
        // ...
    }
}
