<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;
use App\Http\Controllers\BaseController;

class categoriaController extends BaseController
{
    public function index()
    {
        $categorias = Categoria::all();
        return $this->sendResponse($categorias, 'Lista de categorías obtenida correctamente');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombreCategoria' => 'required|string|max:255',
        ]);

        $categoria = Categoria::create([
            'nombreCategoria' => $request->nombreCategoria
        ]);

        return $this->sendResponse($categoria, 'Categoría creada correctamente');
    }

    public function show($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return $this->sendError('Categoría no encontrada');
        }

        return $this->sendResponse($categoria, 'Categoría obtenida correctamente');
    }

    public function updatePartial(Request $request, $id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return $this->sendError('Categoría no encontrada');
        }

        $request->validate([
            'nombreCategoria' => 'sometimes|required|string|max:255',
        ]);

        $categoria->fill($request->only(['nombreCategoria']));
        $categoria->save();

        return $this->sendResponse($categoria, 'Categoría actualizada correctamente');
    }

    public function destroy($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return $this->sendError('Categoría no encontrada');
        }

        $categoria->delete();

        return $this->sendResponse([], 'Categoría eliminada correctamente');
    }
}
