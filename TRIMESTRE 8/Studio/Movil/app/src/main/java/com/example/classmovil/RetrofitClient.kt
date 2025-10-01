package com.example.classmovil

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:8080/api/"
    // ⚠️ Para emulador Android -> backend local
    // Si está en un servidor: "https://midominio.com/api/"

    val instance: ProductoApi by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        retrofit.create(ProductoApi::class.java)
    }
}