<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PedidoProducto;

class PedidoProductoController extends Controller
{
    // Mostrar los productos de un pedido
    public function index($idPedido)
    {
        $items = PedidoProducto::with('producto')
            ->where('idPedido', $idPedido)
            ->get();

        return response()->json(['success' => true, 'data' => $items]);
    }

    // Agregar productos a un pedido
    public function store(Request $request)
    {
        $item = PedidoProducto::create($request->all());
        return response()->json(['success' => true, 'data' => $item]);
    }
}
