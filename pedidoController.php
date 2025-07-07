<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;

class PedidoController extends Controller
{
    // Listar pedidos de un cliente
    public function index($idCliente)
    {
        $pedidos = Pedido::where('idCliente', $idCliente)->get();
        return response()->json(['success' => true, 'data' => $pedidos]);
    }

    // Crear pedido nuevo
    public function store(Request $request)
    {
        $pedido = Pedido::create($request->all());
        return response()->json(['success' => true, 'data' => $pedido]);
    }

    // Mostrar un pedido
    public function show($id)
    {
        $pedido = Pedido::with('productos')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $pedido]);
    }
}
