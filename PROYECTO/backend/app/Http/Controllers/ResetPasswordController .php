<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;

class ResetPasswordController extends Controller
{
    use ResetsPasswords;

    /**
     * Restablece la contraseña del usuario dado un token.
     * Esta es la función que será llamada por tu frontend.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function reset(Request $request)
    {
        Log::info('Recibida solicitud de restablecimiento de contraseña.');

        // Valida los datos: email, password, password_confirmation
        $request->validate($this->rules(), $this->validationErrorMessages());

        // Aquí es donde Laravel intenta restablecer la contraseña.
        // El 'broker()' se encarga de verificar el token, encontrar al usuario y actualizar la contraseña.
        $response = $this->broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => bcrypt($request->password), // Encripta la contraseña
                ])->setRememberToken(Str::random(60))->save(); // Guarda la nueva contraseña y resetea el token de recordar
            }
        );

        // Dependiendo de la respuesta de Laravel
        if ($response == Password::PASSWORD_RESET) {
            Log::info('Contraseña restablecida exitosamente para email: ' . $request->email);
            return response()->json(['message' => 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.'], 200);
        }

        // Si falla, lanza una excepción de validación con el mensaje de error adecuado
        Log::error('Fallo al restablecer contraseña para email: ' . $request->email . ' - Respuesta: ' . $response);
        throw ValidationException::withMessages([
            'email' => [trans($response)],
        ]);
    }

    /**
     * Get the password reset validation rules.
     *
     * @return array
     */
    protected function rules()
    {
        return [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8', // Password debe coincidir con password_confirmation y tener min 8 chars
        ];
    }

    /**
     * Get the password reset validation error messages.
     *
     * @return array
     */
    protected function validationErrorMessages()
    {
        return []; // Puedes personalizar los mensajes de error aquí si es necesario
    }

    /**
     * Get the broker to be used to get repositories.
     *
     * @return \Illuminate\Contracts\Auth\PasswordBroker
     */
    public function broker()
    {
        return Password::broker();
    }
}