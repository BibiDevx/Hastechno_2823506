<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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

