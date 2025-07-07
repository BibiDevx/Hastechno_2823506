<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrito;

class CarritoController extends Controller
{
    // Mostrar productos del carrito del cliente
    public function index($idCliente)
    {
        $carrito = Carrito::with('producto')->where('idCliente', $idCliente)->get();
        return response()->json(['success' => true, 'data' => $carrito]);
    }

    // Agregar producto al carrito
    public function store(Request $request)
    {
        $carrito = Carrito::create($request->all());
        return response()->json(['success' => true, 'data' => $carrito]);
    }

    // Actualizar cantidad
    public function update(Request $request, $id)
    {
        $carrito = Carrito::findOrFail($id);
        $carrito->update($request->all());
        return response()->json(['success' => true, 'data' => $carrito]);
    }

    // Eliminar del carrito
    public function destroy($id)
    {
        Carrito::destroy($id);
        return response()->json(['success' => true, 'message' => 'Producto eliminado del carrito']);
    }
}
