<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 * schema="Cliente",
 * title="Cliente",
 * description="Representa la información de un cliente en el sistema.",
 * @OA\Property(
 * property="idCliente",
 * type="integer",
 * format="int64",
 * description="ID único del cliente.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="nombreCliente",
 * type="string",
 * description="Nombre del cliente.",
 * example="Juan"
 * ),
 * @OA\Property(
 * property="apellidoCliente",
 * type="string",
 * description="Apellido del cliente.",
 * example="Pérez"
 * ),
 * @OA\Property(
 * property="cedulaCliente",
 * type="string",
 * description="Cédula de identidad del cliente.",
 * example="1234567890"
 * ),
 * @OA\Property(
 * property="telefonoCliente",
 * type="string",
 * description="Número de teléfono del cliente.",
 * example="3001234567"
 * ),
 * @OA\Property(
 * property="direccion",
 * type="string",
 * description="Dirección de residencia del cliente.",
 * example="Calle 10 # 20-30, Bogotá"
 * ),
 * @OA\Property(
 * property="idUsuario",
 * type="integer",
 * format="int64",
 * description="ID del usuario asociado a este cliente.",
 * example=5
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
 * description="Información del usuario asociado a este cliente (cargado con eager loading)."
 * )
 * )
 */
class Cliente extends Model
{
    use HasFactory;
    protected $table = 'cliente'; // Nombre correcto de la tabla en la BD
    protected $primaryKey = 'idCliente'; // Clave primaria correcta

    protected $fillable = [
        'nombreCliente',
        'apellidoCliente',
        'cedulaCliente',
        'telefonoCliente',
        'direccion',
        'idUsuario'
    ];
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'idUsuario');
    }
    protected $hidden = ['created_at', 'updated_at'];
}
