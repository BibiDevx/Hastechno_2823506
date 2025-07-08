<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 * schema="Categoria",
 * title="Categoria",
 * description="Representa una categoría para organizar productos.",
 * @OA\Property(
 * property="idCategoria",
 * type="integer",
 * format="int64",
 * description="ID único de la categoría.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="nombreCategoria",
 * type="string",
 * description="Nombre de la categoría.",
 * example="Electrónica"
 * ),
 * @OA\Property(
 * property="created_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de creación de la categoría.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="updated_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de la última actualización de la categoría.",
 * readOnly=true
 * )
 * )
 */
class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categoria';

    protected $primaryKey = 'idCategoria';

    protected $fillable = [
        'nombreCategoria'
    ];

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'categoriaproducto', 'idCategoria', 'idProducto');
    }
    protected $hidden = ['created_at', 'updated_at'];
}
