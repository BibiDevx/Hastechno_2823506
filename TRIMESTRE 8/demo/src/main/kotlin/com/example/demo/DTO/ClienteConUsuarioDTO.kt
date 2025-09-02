package com.example.demo.DTO

data class AdminConUsuarioDTO(
    val idCliente: Int?,
    val idUsuario: Int?,
    val nombreCliente: String,
    val apellidoCliente: String,
    val cedulaCliente: Int,
    val telefonoCliente: String,
    val direccion: String,
    val email: String
)
