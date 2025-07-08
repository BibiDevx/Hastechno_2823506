<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 * schema="Factura",
 * title="Factura",
 * description="Representa una factura generada para un pedido, incluyendo el método de pago y la fecha de emisión.",
 * @OA\Property(
 * property="idFactura",
 * type="integer",
 * format="int64",
 * description="ID único de la factura.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="idPedido",
 * type="integer",
 * format="int64",
 * description="ID del pedido asociado a esta factura.",
 * example=101
 * ),
 * @OA\Property(
 * property="metodoPago",
 * type="string",
 * description="Método de pago utilizado para el pedido.",
 * example="Tarjeta de Crédito"
 * ),
 * @OA\Property(
 * property="fechaFactura",
 * type="string",
 * format="date",
 * description="Fecha de emisión de la factura (formato YYYY-MM-DD).",
 * example="2024-07-07"
 * ),
 * @OA\Property(
 * property="created_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de creación de la factura.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="updated_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de la última actualización de la factura.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="pedido",
 * ref="#/components/schemas/Pedido",
 * description="Objeto del pedido asociado a esta factura (cargado con eager loading)."
 * )
 * )
 */
class Factura extends Model
{
    use HasFactory;
    protected $table = 'factura';
    protected $primaryKey = 'idFactura';
    public $timestamps = true;

    protected $fillable = [
        'idPedido',
        'metodoPago',
        'fechaFactura'
    ];

    // Relaciones
    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'idPedido');
    }
}
