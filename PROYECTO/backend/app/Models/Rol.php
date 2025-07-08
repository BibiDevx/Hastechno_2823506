<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 * schema="Rol",
 * title="Rol",
 * description="Representa el rol de un usuario en el sistema (ej. SuperAdmin, Admin, Cliente).",
 * @OA\Property(
 * property="idRol",
 * type="integer",
 * format="int64",
 * description="ID único del rol.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="nombreRol",
 * type="string",
 * description="Nombre del rol.",
 * example="SuperAdmin"
 * ),
 * @OA\Property(
 * property="created_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de creación del rol.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="updated_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de la última actualización del rol.",
 * readOnly=true
 * )
 * )
 */
class Rol extends Model
{

    protected $table = 'rol';

    protected $primaryKey = 'idRol';

    protected $fillable = [
        'nombreRol'
    ];

    protected $hidden = ['created_at', 'updated_at'];
}
