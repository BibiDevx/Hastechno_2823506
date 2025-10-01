package com.example.classmovil

import retrofit2.Call
import retrofit2.http.*

interface ProductoApi {
    @GET("productos")
    fun obtenerProductos(): Call<List<Producto>>

    @POST("productos")
    fun crearProducto(@Body producto: Producto): Call<Producto>

    @PUT("productos/{id}")
    fun actualizarProducto(@Path("id") id: Int, @Body producto: Producto): Call<Void>

    @DELETE("productos/{id}")
    fun eliminarProducto(@Path("id") id: Int): Call<Void>
}