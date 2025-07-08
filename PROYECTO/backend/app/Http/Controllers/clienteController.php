<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class clienteController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/clientes",
     *     summary="Obtener todos los clientes",
     *     tags={"Clientes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Clientes obtenidos correctamente")
     * )
     */
    public function index()
    {
        $clientes = Cliente::with('usuario')->get();
        return $this->sendResponse($clientes, 'Clientes obtenidos correctamente.');
    }

    /**
     * @OA\Get(
     *     path="/api/clientes/{id}",
     *     summary="Obtener un cliente por ID",
     *     tags={"Clientes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Cliente encontrado"),
     *     @OA\Response(response=404, description="Cliente no encontrado")
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
     * @OA\Put(
     *     path="/api/clientes/perfil",
     *     summary="Actualizar parcialmente el perfil del cliente autenticado",
     *     tags={"Clientes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombreCliente", type="string"),
     *             @OA\Property(property="apellidoCliente", type="string"),
     *             @OA\Property(property="cedulaCliente", type="integer"),
     *             @OA\Property(property="telefonoCliente", type="integer"),
     *             @OA\Property(property="direccion", type="string"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="password", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Perfil actualizado correctamente"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
    public function updatePartial(Request $request)
    {
        $usuario = auth()->user();
        $cliente = $usuario->cliente;

        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombreCliente' => 'sometimes|string|max:255',
            'apellidoCliente' => 'sometimes|string|max:255',
            'cedulaCliente' => 'sometimes|numeric|unique:cliente,cedulaCliente,' . $cliente->idCliente . ',idCliente',
            'telefonoCliente' => 'sometimes|numeric',
            'direccion' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $cliente->update($request->only([
            'nombreCliente', 'apellidoCliente', 'cedulaCliente', 'telefonoCliente', 'direccion'
        ]));

        if ($request->has('email')) {
            $request->validate([
                'email' => 'email|max:255|unique:usuario,email,' . $usuario->idUsuario . ',idUsuario',
            ]);
            $usuario->email = $request->email;
        }

        if ($request->has('password')) {
            $request->validate([
                'password' => 'string|min:6',
            ]);
            $usuario->password = Hash::make($request->password);
        }

        $usuario->save();

        return $this->sendResponse($cliente, 'Perfil actualizado correctamente.');
    }

    /**
     * @OA\Delete(
     *     path="/api/clientes/eliminar",
     *     summary="Eliminar cuenta del cliente autenticado",
     *     tags={"Clientes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Cuenta eliminada correctamente"),
     *     @OA\Response(response=404, description="Cliente no encontrado")
     * )
     */
    public function destroy()
    {
        $usuario = auth()->user();
        $cliente = $usuario->cliente;

        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        $cliente->delete();
        $usuario->delete();

        return $this->sendResponse([], 'Cuenta eliminada correctamente.');
    }

    /**
     * @OA\Put(
     *     path="/api/admin/clientes/{id}",
     *     summary="Actualizar cliente por ID (admin)",
     *     tags={"Clientes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombreCliente", type="string"),
     *             @OA\Property(property="apellidoCliente", type="string"),
     *             @OA\Property(property="cedulaCliente", type="integer"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="password", type="string"),
     *             @OA\Property(property="telefonoCliente", type="integer"),
     *             @OA\Property(property="direccion", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cliente actualizado correctamente"),
     *     @OA\Response(response=404, description="Cliente no encontrado")
     * )
     */
    public function actualizaCliente(Request $request, $id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombreCliente' => 'sometimes|string|max:255',
            'apellidoCliente' => 'sometimes|string|max:255',
            'cedulaCliente' => 'sometimes|numeric|unique:cliente,cedulaCliente,' . $id . ',idCliente',
            'email' => 'sometimes|string|email|max:255|unique:cliente,email,' . $id . ',idCliente',
            'password' => 'sometimes|string|min:6',
            'telefonoCliente' => 'sometimes|numeric',
            'direccion' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $input = $request->only([
            'nombreCliente', 'apellidoCliente', 'cedulaCliente', 'email', 'telefonoCliente', 'direccion',
        ]);

        if ($request->has('password')) {
            $input['password'] = Hash::make($request->password);
        }

        $cliente->update($input);

        return $this->sendResponse($cliente, 'Cliente actualizado correctamente.');
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/clientes/{id}",
     *     summary="Eliminar cliente por ID (admin)",
     *     tags={"Clientes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Cliente eliminado exitosamente"),
     *     @OA\Response(response=404, description="Cliente no encontrado")
     * )
     */
    public function eliminaCliente($id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        $cliente->delete();
        return $this->sendResponse([], 'Cliente eliminado exitosamente.');
    }
}
