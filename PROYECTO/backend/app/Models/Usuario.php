<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

/**
 * @OA\Schema(
 * schema="Usuario",
 * title="Usuario",
 * description="Representa un usuario autenticable en el sistema, incluyendo su rol y relaciones con perfiles específicos (Admin, Cliente).",
 * @OA\Property(
 * property="idUsuario",
 * type="integer",
 * format="int64",
 * description="ID único del usuario.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="idRol",
 * type="integer",
 * format="int64",
 * description="ID del rol asociado al usuario (ej. 1 para SuperAdmin, 2 para Admin, 3 para Cliente).",
 * example=1
 * ),
 * @OA\Property(
 * property="email",
 * type="string",
 * format="email",
 * description="Correo electrónico único del usuario.",
 * example="usuario@example.com"
 * ),
 * @OA\Property(
 * property="password",
 * type="string",
 * format="password",
 * description="Contraseña del usuario (solo para entrada, no se expone en la salida).",
 * writeOnly=true,
 * example="password123"
 * ),
 * @OA\Property(
 * property="created_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de creación del usuario.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="updated_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de la última actualización del usuario.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="rol",
 * ref="#/components/schemas/Rol",
 * description="Objeto de rol asociado al usuario."
 * )
 * )
 */
class Usuario extends Authenticatable implements JWTSubject
{
    protected $table = 'usuario';

    protected $primaryKey = 'idUsuario';

    protected $fillable = [
        'idRol',
        'email',
        'password'
    ];
    protected $hidden = [
        'password', // Oculta la contraseña en respuestas JSON
        'created_at', 'updated_at'
    ];

    // 🔹 Métodos para JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'idRol');
    }
    public function admin()
    {
        return $this->hasOne(Admin::class, 'idUsuario');
    }
    public function cliente()
    {
        return $this->hasOne(Cliente::class, 'idUsuario');
    }
    public function esSuperAdmin()
    {
        return $this->rol && $this->rol->nombreRol === 'SuperAdmin';
    }
}
