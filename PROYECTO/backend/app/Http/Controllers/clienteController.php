<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class clienteController extends BaseController
{
    // 🔹 Obtener todos los clientes
    public function index()
    {
        // Carga la relación 'usuario' junto con cada cliente
        $clientes = Cliente::with('usuario')->get();
        // Asegúrate de que tu BaseController o método de respuesta maneje el formato success/data
        return $this->sendResponse($clientes, 'Clientes obtenidos correctamente.');
    }

    // 🔹 Obtener un cliente por ID
    public function show($id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }
        return $this->sendResponse($cliente, 'Cliente encontrado.');
    }


    // 🔹 Actualizar parcialmente un cliente
    public function updatePartial(Request $request)
    {
        $usuario = auth()->user(); // Esto obtiene al usuario logueado
        $cliente = $usuario->cliente; // Relación cliente desde el modelo Usuario

        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        // Validar campos del cliente
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

        $usuario->save(); // Guardamos los cambios de email o password si hubo

        return $this->sendResponse($cliente, 'Perfil actualizado correctamente.');
    }


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
    public function actualizaCliente(Request $request, $id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return $this->sendError('Cliente no encontrado.', [], 404);
        }

        // Validaciones solo para los campos enviados
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

        // Obtener los campos que se enviaron
        $input = $request->only([
            'nombreCliente',
            'apellidoCliente',
            'cedulaCliente',
            'email',
            'telefonoCliente',
            'direccion',
        ]);

        // Si enviaron clave, cifrarla
        if ($request->has('password')) {
            $input['password'] = Hash::make($request->password);
        }

        $cliente->update($input);

        return $this->sendResponse($cliente, 'Cliente actualizado correctamente.');
    }
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
