<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Factura;

class facturaController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/facturas/{idPedido}",
     *     summary="Obtener una factura por ID de pedido",
     *     tags={"Facturas"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="idPedido",
     *         in="path",
     *         description="ID del pedido asociado a la factura",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Factura obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object", nullable=true,
     *                 @OA\Property(property="idFactura", type="integer", example=1),
     *                 @OA\Property(property="idPedido", type="integer", example=10),
     *                 @OA\Property(property="fechaFactura", type="string", format="date", example="2025-06-08"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2025-06-08T12:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2025-06-08T12:00:00Z")
     *             )
     *         )
     *     )
     * )
     */
    public function show($idPedido)
    {
        $factura = Factura::where('idPedido', $idPedido)->first();
        return response()->json(['success' => true, 'data' => $factura]);
    }
}
