<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Factura;

class FacturaController extends Controller
{
    // Mostrar factura por pedido
    public function show($idPedido)
    {
        $factura = Factura::where('idPedido', $idPedido)->first();
        return response()->json(['success' => true, 'data' => $factura]);
    }

    // Crear nueva factura
    public function store(Request $request)
    {
        $factura = Factura::create($request->all());
        return response()->json(['success' => true, 'data' => $factura]);
    }
}
