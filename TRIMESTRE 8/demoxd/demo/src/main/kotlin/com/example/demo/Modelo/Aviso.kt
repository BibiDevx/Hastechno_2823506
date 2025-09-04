package com.example.demo.Modelo

data class Aviso (
    val idAviso:Int?=null,
    val idUsuario: Int,
    val titulo:String,
    val contenido: String,
    val estado:String
)