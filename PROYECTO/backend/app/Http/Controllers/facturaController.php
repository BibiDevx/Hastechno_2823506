<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Factura;

/**
 * @OA\Tag(
 * name="Facturas",
 * description="Operaciones relacionadas con la gestión de facturas."
 * )
 */
class facturaController extends Controller
{
    /**
     * @OA\Get(
     * path="/api/facturas/pedido/{idPedido}",
     * summary="Mostrar factura por ID de pedido",
     * tags={"Facturas"},
     * @OA\Parameter(
     * name="idPedido",
     * in="path",
     * required=true,
     * description="ID del pedido para el cual se desea obtener la factura.",
     * @OA\Schema(type="integer", format="int64")
     * ),
     * @OA\Response(
     * response=200,
     * description="Factura obtenida correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="data", ref="#/components/schemas/Factura")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Factura no encontrada para el ID de pedido proporcionado.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=false),
     * @OA\Property(property="data", type="object", nullable=true, example=null),
     * @OA\Property(property="message", type="string", example="Factura no encontrada para el pedido.")
     * )
     * )
     * )
     */
    public function show($idPedido)
    {
        $factura = Factura::where('idPedido', $idPedido)->first();

        if (!$factura) {
            // Adaptado para devolver un mensaje de error si no se encuentra la factura
            return response()->json(['success' => false, 'data' => null, 'message' => 'Factura no encontrada para el pedido.'], 404);
        }
        return response()->json(['success' => true, 'data' => $factura]);
    }
}
