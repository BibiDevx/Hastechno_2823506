package com.example.demo.Modelo

data class Comentario(
    val idComentario:Int?=null,
    val idAviso:Int,
    val idUsuario: Int,
    val contenido: String
)