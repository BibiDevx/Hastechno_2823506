package com.example.demo.modelo

data class Admin(
    val idAdmin: Int?=null,
    val idUsuario:Int?=null,
    val cedulaAdmin: Int,
    val nombreAdmin: String,
    val apellidoAdmin: String,
    val telefonoAdmin: String
)