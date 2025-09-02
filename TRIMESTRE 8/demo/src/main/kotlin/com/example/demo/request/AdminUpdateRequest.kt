package com.example.demo.request

data class AdminUpdateRequest(
    val nombreAdmin: String?,
    val apellidoAdmin: String?,
    val cedulaAdmin: Int?,
    val telefonoAdmin: String?,
    val email: String?,
    val password: String?,
    val idRol: Int?
)