<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proveedor;
use App\Http\Controllers\BaseController;

class ProveedorController extends BaseController
{
    public function index()
    {
        $proveedores = Proveedor::all();
        return $this->sendResponse($proveedores, 'Lista de proveedores obtenida correctamente');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombreProveedor' => 'required|string|max:255',
            'correoProveedor' => 'required|email|max:255|unique:proveedor,correoProveedor',
            'telefonoProveedor' => 'required|string|max:20',
        ]);

        $proveedor = Proveedor::create([
            'nombreProveedor' => $request->nombreProveedor,
            'correoProveedor' => $request->correoProveedor,
            'telefonoProveedor' => $request->telefonoProveedor,
        ]);

        return $this->sendResponse($proveedor, 'Proveedor creado correctamente');
    }

    public function show($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado');
        }

        return $this->sendResponse($proveedor, 'Proveedor obtenido correctamente');
    }

    public function updatePartial(Request $request, $id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado');
        }

        $request->validate([
            'nombreProveedor' => 'sometimes|required|string|max:255',
            'correoProveedor' => 'sometimes|required|email|max:255|unique:proveedor,correoProveedor,' . $id,
            'telefonoProveedor' => 'sometimes|required|string|max:20',
        ]);

        $proveedor->fill($request->only(['nombreProveedor', 'correoProveedor', 'telefonoProveedor']));
        $proveedor->save();

        return $this->sendResponse($proveedor, 'Proveedor actualizado correctamente');
    }

    public function destroy($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado');
        }

        $proveedor->delete();

        return $this->sendResponse([], 'Proveedor eliminado correctamente');
    }
}