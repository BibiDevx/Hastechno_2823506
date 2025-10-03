package com.example.classmovil.api

import com.example.classmovil.modelo.Producto
import com.example.classmovil.modelo.Marca
import com.example.classmovil.modelo.Categoria
import retrofit2.Call
import retrofit2.http.*

interface ApiService {
    @GET("productos")
    fun obtenerProductos(): Call<List<Producto>>

    @POST("productos")
    fun crearProducto(@Body producto: Producto): Call<Producto>

    @PUT("productos/{id}")
    fun actualizarProducto(@Path("id") id: Int, @Body producto: Producto): Call<Void>

    @DELETE("productos/{id}")
    fun eliminarProducto(@Path("id") id: Int): Call<Void>


    // ---------- CATEGORÍAS ----------
    @GET("categorias")
    fun obtenerCategorias(): Call<List<Categoria>>

    @POST("categorias/")
    fun crearCategoria(@Body categoria: Categoria): Call<Categoria>

    @PUT("categorias/{id}")
    fun actualizarCategoria(@Path("id") id: Int, @Body categoria: Categoria): Call<Void>

    @DELETE("categorias/{id}")
    fun eliminarCategoria(@Path("id") id: Int): Call<Void>


    // ---------- MARCAS ----------
    @GET("marcas")
    fun obtenerMarcas(): Call<List<Marca>>

    @POST("marcas")
    fun crearMarca(@Body marca: Marca): Call<Marca>

    @PUT("marcas/{id}")
    fun actualizarMarca(@Path("id") id: Int, @Body marca: Marca): Call<Void>

    @DELETE("marcas/{id}")
    fun eliminarMarca(@Path("id") id: Int): Call<Void>

    //categoriaporproducto
    @GET("productos/{id}/categorias")
    fun getCategoriasPorProducto(
        @Path("id") idProducto: Int
    ): Call<List<Int>>  // O Call<List<Categoria>> si tu backend devuelve objetos completos

    @PATCH("productos/{id}/categorias")
    fun syncCategorias(
        @Path("id") idProducto: Int,
        @Body body: Map<String, List<Int>> // {"categorias": [1,2,3]}
    ): Call<Void>
}