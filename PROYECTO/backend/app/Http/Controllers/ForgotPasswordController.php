<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 *     name="Autenticación",
 *     description="Endpoints relacionados con login, registro y recuperación de contraseña"
 * )
 */
class ForgotPasswordController extends Controller
{
    use SendsPasswordResetEmails;

    /**
     * @OA\Post(
     *     path="/api/password/email",
     *     summary="Enviar enlace de restablecimiento de contraseña",
     *     description="Envía un enlace al correo electrónico del usuario para restablecer la contraseña.",
     *     tags={"Autenticación"},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Correo del usuario que desea restablecer su contraseña",
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@correo.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Correo de restablecimiento enviado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Se ha enviado un enlace de recuperación a tu correo electrónico.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Correo inválido o no encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\Property(
     *                     property="email",
     *                     type="array",
     *                     @OA\Items(type="string", example="No podemos encontrar un usuario con esa dirección de correo.")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function sendResetLinkEmail(Request $request)
    {
        Log::info('Recibida solicitud de restablecimiento de contraseña para email: ' . $request->email);

        $request->validate(['email' => 'required|email']);

        $response = $this->broker()->sendResetLink(
            $request->only('email')
        );

        if ($response == Password::RESET_LINK_SENT) {
            Log::info('Enlace de restablecimiento de contraseña enviado a: ' . $request->email);
            return response()->json(['message' => 'Se ha enviado un enlace de recuperación a tu correo electrónico.'], 200);
        }

        Log::error('Fallo al enviar enlace de restablecimiento para email: ' . $request->email . ' - Respuesta: ' . $response);
        throw ValidationException::withMessages([
            'email' => [trans($response)],
        ]);
    }
}
