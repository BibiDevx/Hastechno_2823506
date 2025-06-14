<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;


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
