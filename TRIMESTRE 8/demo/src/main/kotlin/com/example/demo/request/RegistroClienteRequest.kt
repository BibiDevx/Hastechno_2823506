package com.example.demo.request

data class RegistroClienteRequest (
    val nombreCliente: String,
    val apellidoCliente: String,
    val cedulaCliente: Int,
    val email: String,
    val password: String,
    val telefonoCliente: String,
    val direccion: String
    )