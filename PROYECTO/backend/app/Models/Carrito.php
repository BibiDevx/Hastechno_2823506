<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
