<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 * schema="PedidoProducto",
 * title="Pedido Producto",
 * description="Representa un item de producto dentro de un pedido, detallando la cantidad y el valor total de ese producto en particular.",
 * @OA\Property(
 * property="id",
 * type="integer",
 * format="int64",
 * description="ID único del registro de PedidoProducto (clave primaria de la tabla pivote).",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="idPedido",
 * type="integer",
 * format="int64",
 * description="ID del pedido al que pertenece este item.",
 * example=101
 * ),
 * @OA\Property(
 * property="idProducto",
 * type="integer",
 * format="int64",
 * description="ID del producto asociado a este item.",
 * example=205
 * ),
 * @OA\Property(
 * property="cantidadProducto",
 * type="integer",
 * description="Cantidad de este producto en el pedido.",
 * example=2
 * ),
 * @OA\Property(
 * property="valorTotal",
 * type="number",
 * format="float",
 * description="Valor total de este producto (cantidad * precio unitario) dentro del pedido.",
 * example=2400.00
 * ),
 * @OA\Property(
 * property="created_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de creación del registro.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="updated_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de la última actualización del registro.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="pedido",
 * ref="#/components/schemas/Pedido",
 * description="Objeto del pedido al que pertenece este item (cargado con eager loading)."
 * ),
 * @OA\Property(
 * property="producto",
 * ref="#/components/schemas/Producto",
 * description="Objeto del producto asociado a este item (cargado con eager loading)."
 * )
 * )
 */
class PedidoProducto extends Model
{
    use HasFactory;
    protected $table = 'pedidoproducto';
    public $timestamps = true;
    protected $fillable = [
        'idPedido',
        'idProducto',
        'cantidadProducto',
        'valorTotal',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'idPedido');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'idProducto');
    }
}
