<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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

