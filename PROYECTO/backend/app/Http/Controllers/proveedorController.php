<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proveedor;
use App\Http\Controllers\BaseController; // Asegúrate de que BaseController esté disponible
use Illuminate\Support\Facades\Validator; // Para usar Validator::make, que es más flexible

class proveedorController extends BaseController
{
    public function index()
    {
        $proveedores = Proveedor::all();
        return $this->sendResponse($proveedores, 'Lista de proveedores obtenida correctamente');
    }

    public function store(Request $request)
    {
        // Usar Validator::make para un mejor control de los errores
        $validator = Validator::make($request->all(), [
            'nombreProveedor' => 'required|string|max:255',
            'emailProveedor' => 'required|email|max:255|unique:proveedor,emailProveedor', // ¡CAMBIADO AQUÍ!
            'telefonoProveedor' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422); // Código 422 para errores de validación
        }

        $proveedor = Proveedor::create([
            'nombreProveedor' => $request->nombreProveedor,
            'emailProveedor' => $request->emailProveedor, // ¡CAMBIADO AQUÍ!
            'telefonoProveedor' => $request->telefonoProveedor,
        ]);

        return $this->sendResponse($proveedor, 'Proveedor creado correctamente'); // Código 201 para creación exitosa
    }

    public function show($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado', [], 404); // Añadir [] para data vacía
        }

        return $this->sendResponse($proveedor, 'Proveedor obtenido correctamente');
    }

    public function updatePartial(Request $request, $id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado', [], 404);
        }

        // Usar Validator::make
        $validator = Validator::make($request->all(), [
            'nombreProveedor' => 'sometimes|required|string|max:255',
            'emailProveedor' => 'sometimes|required|email|max:255|unique:proveedor,emailProveedor,' . $id . ',idProveedor', 
            'telefonoProveedor' => 'sometimes|required|string|max:20',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Errores de validación.', $validator->errors(), 422);
        }

        $proveedor->fill($request->only(['nombreProveedor', 'emailProveedor', 'telefonoProveedor'])); // ¡CAMBIADO AQUÍ!
        $proveedor->save();

        return $this->sendResponse($proveedor, 'Proveedor actualizado correctamente');
    }

    public function destroy($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return $this->sendError('Proveedor no encontrado', [], 404);
        }

        // Puedes añadir validaciones adicionales aquí, por ejemplo, si el proveedor tiene productos asociados
        // $productosAsociados = $proveedor->productos()->count();
        // if ($productosAsociados > 0) {
        //     return $this->sendError('No se puede eliminar el proveedor porque tiene productos asociados.', [], 409);
        // }

        $proveedor->delete();

        return $this->sendResponse([], 'Proveedor eliminado correctamente');
    }
}
