package com.example.demo.request

data class RegistroAdminRequest(
    val nombreAdmin: String,
    val apellidoAdmin: String,
    val cedulaAdmin: Int,
    val email: String,
    val password: String,
    val telefonoAdmin: String
)