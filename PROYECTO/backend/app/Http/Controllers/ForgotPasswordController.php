<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password; // Asegúrate de importar esto
use Illuminate\Support\Facades\Log; // Para depuración

class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use SendsPasswordResetEmails;

    /**
     * Envía un enlace de restablecimiento al usuario.
     * Esta es la función que será llamada por tu frontend.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function sendResetLinkEmail(Request $request)
    {
        Log::info('Recibida solicitud de restablecimiento de contraseña para email: ' . $request->email);

        // Valida que el email sea requerido y tenga formato de email
        $request->validate(['email' => 'required|email']);

        // Aquí es donde Laravel intenta enviar el correo.
        // El 'broker()' por defecto usa el "users" guard. y envía el correo.
        $response = $this->broker()->sendResetLink(
            $request->only('email')
        );

        // Dependiendo de la respuesta de Laravel, enviamos un JSON adecuado
        if ($response == Password::RESET_LINK_SENT) {
            Log::info('Enlace de restablecimiento de contraseña enviado a: ' . $request->email);
            return response()->json(['message' => 'Se ha enviado un enlace de recuperación a tu correo electrónico.'], 200);
        }

        // Si ocurre un error (ej. email no encontrado), lanzamos una excepción de validación
        // con el mensaje de error traducido de Laravel.
        Log::error('Fallo al enviar enlace de restablecimiento para email: ' . $request->email . ' - Respuesta: ' . $response);
        throw ValidationException::withMessages([
            'email' => [trans($response)], // trans($response) proporcionará el mensaje de error adecuado
        ]);
    }

    // Nota: No necesitas el método 'reset' aquí, ese va en ResetPasswordController
}