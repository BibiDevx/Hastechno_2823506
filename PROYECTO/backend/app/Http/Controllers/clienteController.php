<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Usuario; // Asegúrate de tener este 'use' si el modelo de Usuario se llama así
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

/**
 * @OA\Tag(
 * name="Clientes",
 * description="Operaciones relacionadas con la gestión de clientes."
 * )
 *
 * @OA\Schema(
 * schema="ClienteConUsuario",
 * title="Cliente con Usuario",
 * description="Representa un cliente con la información de su usuario asociada.",
 * allOf={
 * @OA\Schema(ref="#/components/schemas/Cliente"),
 * @OA\Schema(
 * @OA\Property(
 * property="usuario",
 * ref="#/components/schemas/Usuario",
 * description="Información del usuario asociado al cliente."
 * )
 * )
 * }
 * )
 *
 * @OA\Schema(
 * schema="ClienteUpdateInput",
 * title="Entrada de Actualización de Cliente",
 * description="Campos opcionales para actualizar el perfil de un cliente o un cliente específico.",
 * @OA\Property(property="nombreCliente", type="string", maxLength=255, description="Nuevo nombre del cliente."),
 * @OA\Property(property="apellidoCliente", type="string", maxLength=255, description="Nuevo apellido del cliente."),
 * @OA\Property(property="cedulaCliente", type="string", description="Nueva cédula de identidad del cliente (debe ser única)."),
 * @OA\Property(property="telefonoCliente", type="string", description="Nuevo número de teléfono del cliente."),
 * @OA\Property(property="direccion", type="string", maxLength=255, description="Nueva dirección del cliente."),
 * @OA\Property(property="email", type="string", format="email", maxLength=255, description="Nuevo correo electrónico del usuario asociado (debe ser único)."),
 * @OA\Property(property="password", type="string", minLength=6, description="Nueva contraseña del usuario asociado (mínimo 6 caracteres).")
 * )
 */
class clienteController extends BaseController
{
    /**
     * @OA\Get(
     * path="/api/consumidores/clientes",
     * summary="Obtener todos los clientes",
     * tags={"Clientes"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Lista de clientes obtenida correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Clientes obtenidos correctamente."),
     * @OA\Property(
     * property="data",
     * type="array",
     * @OA\Items(ref="#/components/schemas/ClienteConUsuario")
     * )
     * )
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function index()
    {
        // Carga la relación 'usuario' junto con cada cliente
        $clientes = Cliente::with('usuario')->get();
        return $this->sendResponse($clientes, 'Clientes obtenidos correctamente.');
    }

    /**
     * @OA\Get(
     * path="/api/consumidores/clientes/{id}",
     * summary="Obtener un cliente por ID",
     * tags={"Clientes"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del cliente a obtener.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Cliente encontrado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Cliente encontrado."),
     * @OA\Property(property="data", ref="#/components/schemas/ClienteConUsuario")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Cliente no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function show($id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }
        return $this->sendResponse($cliente, 'Cliente encontrado.');
    }

    /**
     * @OA\Patch(
     * path="/api/clientes/actualizar/cuenta",
     * summary="Actualizar parcialmente el perfil del cliente autenticado",
     * tags={"Clientes", "Perfil"},
     * security={{"bearerAuth": {}}},
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar el perfil del cliente. Los campos son opcionales (sometimes).",
     * @OA\JsonContent(ref="#/components/schemas/ClienteUpdateInput")
     * ),
     * @OA\Response(
     * response=200,
     * description="Perfil actualizado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Perfil actualizado correctamente."),
     * @OA\Property(property="data", ref="#/components/schemas/Cliente")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Cliente no encontrado (asociado al usuario autenticado).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=422,
     * description="Errores de validación.",
     * @OA\JsonContent(ref="#/components/schemas/ValidationError")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function updatePartial(Request $request)
    {
        $usuario = auth()->user(); // Esto obtiene al usuario logueado
        $cliente = $usuario->cliente; // Relación cliente desde el modelo Usuario

        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        // Validar campos del cliente
        $validator = Validator::make($request->all(), [
            'nombreCliente' => 'sometimes|string|max:255|regex:/^[\pL\s\-]+$/u',
            'apellidoCliente' => 'sometimes|string|max:255|regex:/^[\pL\s\-]+$/u',
            'cedulaCliente' => 'sometimes|numeric|unique:cliente,cedulaCliente,' . $cliente->idCliente . ',idCliente',
            'telefonoCliente' => 'sometimes|numeric',
            'direccion' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        // Actualizar datos del cliente
        $cliente->update($request->only([
            'nombreCliente',
            'apellidoCliente',
            'cedulaCliente',
            'telefonoCliente',
            'direccion',
        ]));

        //  Ahora actualizamos email y contraseña desde el modelo Usuario
        if ($request->has('email')) {
            $validatorEmail = Validator::make($request->only('email'), [
                'email' => 'email|max:255|unique:usuario,email,' . $usuario->idUsuario . ',idUsuario',
            ]);
            if ($validatorEmail->fails()) {
                return $this->sendError('Errores de validación.', $validatorEmail->errors(), 422);
            }
            $usuario->email = $request->email;
        }

        if ($request->has('password')) {
            $validatorPassword = Validator::make($request->only('password'), [
                'password' => 'string|min:6',
            ]);
            if ($validatorPassword->fails()) {
                return $this->sendError('Errores de validación.', $validatorPassword->errors(), 422);
            }
            $usuario->password = Hash::make($request->password);
        }

        $usuario->save(); // Guardamos los cambios de email o password si hubo

        return $this->sendResponse($cliente, 'Perfil actualizado correctamente.');
    }

    /**
     * @OA\Delete(
     * path="/api/clientes/eliminar/cuenta",
     * summary="Eliminar la cuenta del cliente autenticado",
     * tags={"Clientes", "Perfil"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Cuenta eliminada correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Cuenta eliminada correctamente."),
     * @OA\Property(property="data", type="array", * @OA\Items(type="object"),example={})
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Cliente no encontrado (asociado al usuario autenticado).",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function destroy()
    {
        $usuario = auth()->user(); // Obtiene el usuario logueado
        $cliente = $usuario->cliente; // Relación cliente desde el modelo Usuario

        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        // Eliminar datos del cliente
        $cliente->delete();

        // Eliminar el usuario (que está asociado al cliente)
        $usuario->delete();

        return $this->sendResponse([], 'Cuenta eliminada correctamente.');
    }

    /**
     * @OA\Patch(
     * path="/api/consumidores/clientes/actualizar/{id}",
     * summary="Actualizar un cliente por ID (solo para administradores)",
     * tags={"Clientes", "Administración"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del cliente a actualizar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\RequestBody(
     * required=true,
     * description="Datos para actualizar el cliente. Los campos son opcionales (sometimes).",
     * @OA\JsonContent(ref="#/components/schemas/ClienteUpdateInput")
     * ),
     * @OA\Response(
     * response=200,
     * description="Cliente actualizado correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Cliente actualizado correctamente."),
     * @OA\Property(property="data", ref="#/components/schemas/Cliente")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Cliente no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=422,
     * description="Errores de validación.",
     * @OA\JsonContent(ref="#/components/schemas/ValidationError")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function actualizaCliente(Request $request, $id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        // Validaciones solo para los campos enviados
        $validator = Validator::make($request->all(), [
            'nombreCliente' => 'sometimes|string|max:255|regex:/^[\pL\s\-]+$/u',
            'apellidoCliente' => 'sometimes|string|max:255|regex:/^[\pL\s\-]+$/u',
            'cedulaCliente' => 'sometimes|numeric|unique:cliente,cedulaCliente,' . $id . ',idCliente',
            // La validación de email aquí es para el campo del cliente, no del usuario.
            // Si el email se actualiza a través del modelo Usuario, esta validación debe ser en el modelo Usuario.
            // Asumo que 'email' aquí es un campo directo del cliente o se maneja a través de la relación.
            // Si es del usuario, la lógica de validación debe ser la misma que en updatePartial.
            'email' => 'sometimes|string|email|max:255|unique:usuario,email,' . $cliente->idUsuario . ',idUsuario',
            'password' => 'sometimes|string|min:6', // Asumo que esto actualiza la contraseña del usuario asociado
            'telefonoCliente' => 'sometimes|numeric',
            'direccion' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        // Obtener los campos que se enviaron para el cliente
        $inputCliente = $request->only([
            'nombreCliente',
            'apellidoCliente',
            'cedulaCliente',
            'telefonoCliente',
            'direccion',
        ]);

        $cliente->update($inputCliente);

        // Actualizar el usuario asociado si se proporcionan email o password
        $usuarioAsociado = $cliente->usuario;
        if ($usuarioAsociado) {
            $inputUsuario = [];
            if ($request->has('email')) {
                $inputUsuario['email'] = $request->email;
            }
            if ($request->has('password')) {
                $inputUsuario['password'] = Hash::make($request->password);
            }
            if (!empty($inputUsuario)) {
                $usuarioAsociado->update($inputUsuario);
            }
        }

        return $this->sendResponse($cliente, 'Cliente actualizado correctamente.');
    }

    /**
     * @OA\Delete(
     * path="/api/consumidores/clientes/eliminar/{id}",
     * summary="Eliminar un cliente por ID (solo para administradores)",
     * tags={"Clientes", "Administración"},
     * security={{"bearerAuth": {}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID del cliente a eliminar.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Cliente eliminado exitosamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Cliente eliminado exitosamente."),
     * @OA\Property(property="data", type="array", * @OA\Items(type="object"),example={})
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Cliente no encontrado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function eliminaCliente($id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        // También eliminar el usuario asociado si existe
        $usuarioAsociado = $cliente->usuario;

        $cliente->delete();

        if ($usuarioAsociado) {
            $usuarioAsociado->delete();
        }

        return $this->sendResponse([], 'Cliente eliminado exitosamente.');
    }
}
