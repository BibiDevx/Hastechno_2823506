<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Marca;
use App\Http\Controllers\BaseController;

class marcaController extends BaseController
{
    public function index()
    {
        $marcas = Marca::all();
        return $this->sendResponse($marcas, 'Lista de marcas obtenida correctamente');
    }


    public function store(Request $request)
    {
        $request->validate([
            'nombreMarca' => 'required|string|max:255',
        ]);

        $marca = Marca::create([
            'nombreMarca' => $request->nombreMarca
        ]);

        return $this->sendResponse($marca, 'Marca creada correctamente');
    }

    public function show($id)
    {
        $marca = Marca::find($id);

        if (!$marca) {
            return $this->sendError('Marca no encontrada');
        }

        return $this->sendResponse($marca, 'Marca obtenida correctamente');
    }

    public function updatePartial(Request $request, $id)
    {
        $marca = Marca::find($id);

        if (!$marca) {
            return $this->sendError('Marca no encontrada');
        }

        $request->validate([
            'nombreMarca' => 'sometimes|required|string|max:255',
        ]);

        $marca->fill($request->only(['nombreMarca']));
        $marca->save();

        return $this->sendResponse($marca, 'Marca actualizada correctamente');
    }

    public function destroy($id)
    {
        $marca = Marca::find($id);

        if (!$marca) {
            return $this->sendError('Marca no encontrada');
        }

        $marca->delete();

        return $this->sendResponse([], 'Marca eliminada correctamente');
    }
}
