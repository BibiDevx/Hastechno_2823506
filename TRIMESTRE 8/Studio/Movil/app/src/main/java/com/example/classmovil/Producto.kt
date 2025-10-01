package com.example.classmovil

data class Producto(
    val idProducto: Int? = null,
    val nombreProducto: String,
    val definicion: String,
    val idMarca: Int,
    val valorProducto: Int,
    val disponibilidad: Boolean,
    val cantidadStock: Int,
    val idProveedor: Int
)