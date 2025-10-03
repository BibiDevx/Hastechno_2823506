package com.example.classmovil.modelo

data class Categoria(
    val idCategoria: Int?=null,
    val nombreCategoria: String,
    var seleccionada: Boolean = false
)
