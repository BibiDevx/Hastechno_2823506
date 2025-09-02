package com.example.demo.modelo

data class Cliente(
    val idCliente:Int?=null,
    val idUsuario:Int?=null,
    val cedulaCliente: Int,
    val nombreCliente: String,
    val apellidoCliente: String,
    val telefonoCliente:String,
    val direccion: String
)