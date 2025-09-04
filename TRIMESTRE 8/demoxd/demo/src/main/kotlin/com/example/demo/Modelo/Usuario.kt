package com.example.demo.Modelo

data class Usuario(
    val idUsuario: Int?=null,
    val email: String,
    val password: String,
    val nombre:String,
    val cedula: Int,
    val direccion: String,
    val telefono: String
)