<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Factura;

class facturaController extends Controller
{
    // Mostrar factura por pedido
    public function show($idPedido)
    {
        $factura = Factura::where('idPedido', $idPedido)->first();
        return response()->json(['success' => true, 'data' => $factura]);
    }
}
