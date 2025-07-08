<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * @OA\Tag(
 *     name="Autenticación",
 *     description="Endpoints relacionados con login, registro y recuperación de contraseña"
 * )
 */
class ResetPasswordController extends Controller
{
    use ResetsPasswords;

    /**
     * @OA\Post(
     *     path="/api/password/reset",
     *     summary="Restablecer contraseña",
     *     description="Permite restablecer la contraseña de un usuario mediante token, email y nueva contraseña.",
     *     tags={"Autenticación"},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Datos necesarios para restablecer la contraseña",
     *         @OA\JsonContent(
     *             required={"token","email","password","password_confirmation"},
     *             @OA\Property(property="token", type="string", example="abcdefgh12345678"),
     *             @OA\Property(property="email", type="string", format="email", example="usuario@correo.com"),
     *             @OA\Property(property="password", type="string", example="nuevaPassword123"),
     *             @OA\Property(property="password_confirmation", type="string", example="nuevaPassword123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Contraseña restablecida correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación o token inválido",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\Property(
     *                     property="email",
     *                     type="array",
     *                     @OA\Items(type="string", example="Este token de restablecimiento de contraseña no es válido.")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function reset(Request $request)
    {
        Log::info('Recibida solicitud de restablecimiento de contraseña.');

        $request->validate($this->rules(), $this->validationErrorMessages());

        $response = $this->broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => bcrypt($request->password),
                ])->setRememberToken(Str::random(60))->save();
            }
        );

        if ($response == Password::PASSWORD_RESET) {
            Log::info('Contraseña restablecida exitosamente para email: ' . $request->email);
            return response()->json(['message' => 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.'], 200);
        }

        Log::error('Fallo al restablecer contraseña para email: ' . $request->email . ' - Respuesta: ' . $response);
        throw ValidationException::withMessages([
            'email' => [trans($response)],
        ]);
    }

    protected function rules()
    {
        return [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ];
    }

    protected function validationErrorMessages()
    {
        return [];
    }

    public function broker()
    {
        return Password::broker();
    }
}
