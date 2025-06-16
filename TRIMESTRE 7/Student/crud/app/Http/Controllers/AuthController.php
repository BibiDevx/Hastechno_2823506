<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Http\Controllers\BaseController as BaseController;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * @OA\SecurityScheme(
 *     type="http",
 *     description="Usar JWT token",
 *     name="Authorization",
 *     in="header",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="bearerAuth"
 * )
 */

class AuthController extends BaseController
{
 /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Registro de usuario",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","phone","language","password","c_password"},
     *             @OA\Property(property="name", type="string", example="Juan Pérez"),
     *             @OA\Property(property="email", type="string", format="email", example="juan@email.com"),
     *             @OA\Property(property="phone", type="string", example="3001234567"),
     *             @OA\Property(property="language", type="string", example="English"),
     *             @OA\Property(property="password", type="string", format="password", example="12345678"),
     *             @OA\Property(property="c_password", type="string", format="password", example="12345678")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Registro exitoso"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'=>'required',
            'email' => 'required|email',
            'phone' => 'required|digits:10',
            'language' => 'required|in:Spanish,English',
            'password' => 'required',
            'c_password' => 'required|same:password',
        ]);
        if ($validator->fails()) {
            return $this->sendError(
                'Validation Error.',
                $validator->errors()
            );
        }
        $input = $request->all();
        $input['password'] = bcrypt($input['password']);
        $input=$request->except('c_password');
        $student = Student::create($input);
        $success['student'] = $student;

        return $this->sendResponse($success, 'User Registrado successfully.');
    }
        /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login de usuario",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="juan@email.com"),
     *             @OA\Property(property="password", type="string", format="password", example="12345678")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Login exitoso"),
     *     @OA\Response(response=401, description="Credenciales inválidas")
     * )
     */
    public function login(Request $request)
{
    $credentials = $request->only('email', 'password');  // Obtener las credenciales

    // Intentar autenticar al usuario y generar el token
    if (!$token = auth('api')->attempt($credentials)) {
        return $this->sendError('Unauthorized', ['error' => 'Unauthorized'], 401);
    }

    // Retornar el token generado
    $success = $this->respondWithToken($token);
    return $this->sendResponse($success, 'User login successfully');
}
 /**
     * @OA\Get(
     *     path="/api/profile",
     *     summary="Obtener perfil del usuario",
     *     tags={"Auth"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Perfil del usuario autenticado")
     * )
     */
    public function profile()
    {
        // Obtener el usuario autenticado con JWT
        $student = JWTAuth::user();

        // Retornar la respuesta con los datos del usuario
        return $this->sendResponse($student, 'User data retrieved successfully');
    }
     /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Cerrar sesión",
     *     tags={"Auth"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Sesión cerrada exitosamente")
     * )
     */
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());  // Invalidar el token actual
        return $this->sendResponse([], 'User logout successfully');
    }
     /**
     * @OA\Post(
     *     path="/api/refresh",
     *     summary="Refrescar token",
     *     tags={"Auth"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Token renovado")
     * )
     */
    public function refresh()
    {
        $token = JWTAuth::refresh(JWTAuth::getToken());  // Renovar el token JWT
        $success = $this->respondWithToken($token);
        return $this->sendResponse($success, 'Token refreshed successfully');
    }
    protected function respondWithToken($token)
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60, // Obtener TTL desde JWTAuth
        ];
    }
}
