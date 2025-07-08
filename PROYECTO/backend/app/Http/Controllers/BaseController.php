<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller as Controller;

/**
 * @OA\Schema(
 *     schema="RespuestaExitosa",
 *     description="Respuesta estándar para peticiones exitosas",
 *     @OA\Property(property="success", type="boolean", example=true),
 *     @OA\Property(property="data", type="object", example={"id": 1, "nombre": "Ejemplo"}),
 *     @OA\Property(property="message", type="string", example="Operación realizada correctamente.")
 * )
 *
 * @OA\Schema(
 *     schema="RespuestaError",
 *     description="Respuesta estándar para errores",
 *     @OA\Property(property="success", type="boolean", example=false),
 *     @OA\Property(property="message", type="string", example="Error al procesar la solicitud."),
 *     @OA\Property(property="data", type="object", nullable=true, example={"error": "Datos inválidos"})
 * )
 */
class BaseController extends Controller
{
    /**
     * Enviar una respuesta exitosa.
     *
     * @param mixed $result Datos que se enviarán como respuesta
     * @param string $message Mensaje descriptivo
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResponse($result, $message)
    {
        $response = [
            'success' => true,
            'data' => $result,
            'message' => $message,
        ];

        return response()->json($response, 200);
    }

    /**
     * Enviar una respuesta de error.
     *
     * @param string $error Mensaje principal de error
     * @param array $errorMessages Lista de errores detallados (opcional)
     * @param int $code Código HTTP de error (por defecto 404)
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendError($error, $errorMessages = [], $code = 404)
    {
        $response = [
            'success' => false,
            'message' => $error,
        ];

        if (!empty($errorMessages)) {
            $response['data'] = $errorMessages;
        }

        return response()->json($response, $code);
    }
}
