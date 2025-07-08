<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 * schema="Carrito",
 * title="Carrito de Compras",
 * description="Representa un ítem en el carrito de compras de un cliente o un usuario invitado.",
 * @OA\Property(
 * property="idCarrito",
 * type="integer",
 * format="int64",
 * description="ID único del ítem en el carrito.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="idCliente",
 * type="integer",
 * format="int64",
 * nullable=true,
 * description="ID del cliente asociado a este ítem del carrito (null si es un invitado).",
 * example=10
 * ),
 * @OA\Property(
 * property="idProducto",
 * type="integer",
 * format="int64",
 * description="ID del producto en el carrito.",
 * example=205
 * ),
 * @OA\Property(
 * property="cantidad",
 * type="integer",
 * description="Cantidad del producto en el carrito.",
 * example=1
 * ),
 * @OA\Property(
 * property="guest_id",
 * type="string",
 * nullable=true,
 * description="ID único para usuarios no autenticados (invitados).",
 * example="abcd-1234-efgh-5678"
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
 * property="cliente",
 * ref="#/components/schemas/Cliente",
 * description="Objeto del cliente asociado a este ítem del carrito (cargado con eager loading)."
 * ),
 * @OA\Property(
 * property="producto",
 * ref="#/components/schemas/Producto",
 * description="Objeto del producto asociado a este ítem del carrito (cargado con eager loading)."
 * )
 * )
 */
class Carrito extends Model
{
    use HasFactory;
    protected $table = 'carrito';
    protected $primaryKey = 'idCarrito';
    public $timestamps = true;

    protected $fillable = [
        'idCliente',
        'idProducto',
        'cantidad',
        'guest_id' // ¡NUEVO CAMPO!
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente', 'idCliente');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'idProducto', 'idProducto');
    }
}
