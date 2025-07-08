<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 * schema="Admin",
 * title="Administrador",
 * description="Representa la información de un administrador en el sistema.",
 * @OA\Property(
 * property="idAdmin",
 * type="integer",
 * format="int64",
 * description="ID único del administrador.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="idUsuario",
 * type="integer",
 * format="int64",
 * description="ID del usuario asociado a este administrador.",
 * example=1
 * ),
 * @OA\Property(
 * property="nombreAdmin",
 * type="string",
 * description="Nombre del administrador.",
 * example="Carlos"
 * ),
 * @OA\Property(
 * property="apellidoAdmin",
 * type="string",
 * description="Apellido del administrador.",
 * example="Gómez"
 * ),
 * @OA\Property(
 * property="cedulaAdmin",
 * type="string",
 * description="Cédula de identidad del administrador.",
 * example="9876543210"
 * ),
 * @OA\Property(
 * property="telefonoAdmin",
 * type="string",
 * description="Número de teléfono del administrador.",
 * example="3109876543"
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
 * property="usuario",
 * ref="#/components/schemas/Usuario",
 * description="Información del usuario asociado a este administrador (cargado con eager loading)."
 * )
 * )
 */
class Admin extends Model
{
    use HasFactory;

    protected $table = 'admin';

    protected $primaryKey = 'idAdmin';

    protected $fillable = [
        'idUsuario',
        'nombreAdmin',
        'apellidoAdmin',
        'cedulaAdmin',
        'telefonoAdmin'
    ];
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'idUsuario');
    }
    protected $hidden = ['created_at', 'updated_at'];

}
