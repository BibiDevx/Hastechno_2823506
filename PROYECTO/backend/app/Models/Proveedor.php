<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 * schema="Proveedor",
 * title="Proveedor",
 * description="Representa a un proveedor de productos en el sistema.",
 * @OA\Property(
 * property="idProveedor",
 * type="integer",
 * format="int64",
 * description="ID único del proveedor.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="nombreProveedor",
 * type="string",
 * description="Nombre del proveedor.",
 * example="Tech Supplies Inc."
 * ),
 * @OA\Property(
 * property="emailProveedor",
 * type="string",
 * format="email",
 * description="Correo electrónico del proveedor.",
 * example="contacto@techsupplies.com"
 * ),
 * @OA\Property(
 * property="telefonoProveedor",
 * type="string",
 * description="Número de teléfono del proveedor.",
 * example="1234567890"
 * ),
 * @OA\Property(
 * property="created_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de creación del proveedor.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="updated_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de la última actualización del proveedor.",
 * readOnly=true
 * )
 * )
 */
class Proveedor extends Model
{
    use HasFactory;

    protected $table = 'proveedor';

    protected $primaryKey = 'idProveedor';

    protected $fillable = [
        'nombreProveedor',
        'emailProveedor',
        'telefonoProveedor'
    ];
    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'idProveedor');
    }
}
