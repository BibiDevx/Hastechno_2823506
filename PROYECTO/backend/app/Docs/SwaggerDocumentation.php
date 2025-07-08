<?php

namespace App\Docs;

/**
 * @OA\Info(
 * version="1.0.0",
 * title="Documentación de la API de Hastechno",
 * description="API para la gestión de productos, pedidos, usuarios, carritos y más para la tienda virtual Hastechno.",
 * @OA\Contact(
 * email="babeltranp@gmail.com"
 * ),
 * @OA\License(
 * name="Apache 2.0",
 * url="http://www.apache.org/licenses/LICENSE-2.0.html"
 * )
 * )
 *
 * @OA\Server(
 * url="http://localhost:8000/",
 * description="Servidor de desarrollo local de la API"
 * )
 *
 * @OA\SecurityScheme(
 * securityScheme="bearerAuth",
 * type="http",
 * scheme="bearer",
 * bearerFormat="JWT",
 * description="Ingresa tu token JWT con el prefijo 'Bearer ' (ej: 'Bearer eyJ0eXAiOiJKV1Q...') para acceder a los endpoints protegidos."
 * )
 *
 * @OA\Schema(
 * schema="ValidationError",
 * title="Error de Validación",
 * description="Estructura de respuesta para errores de validación de datos de entrada.",
 * @OA\Property(
 * property="message",
 * type="string",
 * example="The given data was invalid.",
 * description="Mensaje general que indica un error de validación."
 * ),
 * @OA\Property(
 * property="errors",
 * type="object",
 * description="Objeto que contiene los detalles de los errores por cada campo.",
 * example={
 * "email": {"The email field is required."},
 * "password": {"The password must be at least 6 characters."}
 * }
 * )
 * )
 *
 * @OA\Schema(
 * schema="ErrorResponse",
 * title="Respuesta de Error General",
 * description="Estructura de respuesta para errores generales de la API (no encontrados, no autorizados, errores internos, etc.).",
 * @OA\Property(
 * property="success",
 * type="boolean",
 * example=false,
 * description="Indica si la operación fue exitosa."
 * ),
 * @OA\Property(
 * property="message",
 * type="string",
 * example="Unauthorized.",
 * description="Mensaje descriptivo del error."
 * ),
 * @OA\Property(
 * property="data",
 * type="object",
 * description="Datos adicionales relacionados con el error (puede estar vacío o contener detalles específicos).",
 * example={}
 * )
 * )
 */
class SwaggerDocumentation
{
    // Este archivo no necesita métodos PHP, solo las anotaciones.
}

