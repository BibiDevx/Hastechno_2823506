<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'producto';
    protected $primaryKey = 'idProducto';
    protected $fillable = [
        'nombreProducto',
        'definicion',
        'valorProducto',
        'idProveedor',
        'disponibilidad',
        'idMarca'
    ];

    public function marca()
    {
        return $this->belongsTo(Marca::class, 'idMarca');
    }

    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'categoriaproducto', 'idProducto', 'idCategoria');
    }

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'idProveedor')->select(['idProveedor', 'nombreProveedor']);
    }
}