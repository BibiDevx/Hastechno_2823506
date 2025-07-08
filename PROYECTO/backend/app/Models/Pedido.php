<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 * schema="Pedido",
 * title="Pedido",
 * description="Representa un pedido realizado por un cliente, incluyendo la fecha y los productos asociados.",
 * @OA\Property(
 * property="idPedido",
 * type="integer",
 * format="int64",
 * description="ID único del pedido.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="idCliente",
 * type="integer",
 * format="int64",
 * description="ID del cliente que realizó el pedido.",
 * example=10
 * ),
 * @OA\Property(
 * property="fechaPedido",
 * type="string",
 * format="date",
 * description="Fecha en que se realizó el pedido (formato YYYY-MM-DD).",
 * example="2024-07-07"
 * ),
 * @OA\Property(
 * property="created_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de creación del pedido.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="updated_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de la última actualización del pedido.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="cliente",
 * ref="#/components/schemas/Cliente",
 * description="Objeto del cliente que realizó el pedido (cargado con eager loading)."
 * ),
 * @OA\Property(
 * property="productos",
 * type="array",
 * @OA\Items(ref="#/components/schemas/PedidoProducto"),
 * description="Lista de productos incluidos en el pedido (cargado con eager loading)."
 * ),
 * @OA\Property(
 * property="factura",
 * ref="#/components/schemas/Factura",
 * description="Objeto de la factura asociada a este pedido (cargado con eager loading)."
 * )
 * )
 */
class Pedido extends Model
{
    use HasFactory;
    protected $table = 'pedido';
    protected $primaryKey = 'idPedido';
    public $timestamps = true;

    protected $fillable = [
        'idCliente',
        'fechaPedido'
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente');
    }

    public function productos()
    {
        return $this->hasMany(PedidoProducto::class, 'idPedido');
    }

    public function factura()
    {
        return $this->hasOne(Factura::class, 'idPedido');
    }
}
