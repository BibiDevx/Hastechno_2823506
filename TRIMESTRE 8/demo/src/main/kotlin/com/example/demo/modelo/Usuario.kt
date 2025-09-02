package com.example.demo.modelo

data class Usuario (
    val idUsuario:Int?=null,
    val email:String,
    val password: String,
    val idRol:Int?=null
)