<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 * schema="Marca",
 * title="Marca",
 * description="Representa la marca de un producto.",
 * @OA\Property(
 * property="idMarca",
 * type="integer",
 * format="int64",
 * description="ID único de la marca.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="nombreMarca",
 * type="string",
 * description="Nombre de la marca.",
 * example="Samsung"
 * ),
 * @OA\Property(
 * property="created_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de creación de la marca.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="updated_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de la última actualización de la marca.",
 * readOnly=true
 * )
 * )
 */
class Marca extends Model
{
    use HasFactory;

    protected $table = 'marca';

    protected $primaryKey = 'idMarca';

    protected $fillable = [
        'nombreMarca'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'idMarca');
    }
    protected $hidden = ['created_at', 'updated_at'];
}
