package com.example.classmovil.vista.categoria

import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.classmovil.R
import com.example.classmovil.RetrofitClient
import com.example.classmovil.modelo.Categoria
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProductoCategoriaActivity : AppCompatActivity() {

    private lateinit var recyclerCategorias: RecyclerView
    private lateinit var adapter: CategoriaCheckAdapter
    private var listaCategorias = mutableListOf<Categoria>()
    private var idProducto: Int? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_producto_categoria)

        idProducto = intent.getIntExtra("idProducto", -1)
        if (idProducto == -1) {
            Toast.makeText(this, "Error: producto no válido", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        recyclerCategorias = findViewById(R.id.recyclerCategoriasProducto)
        recyclerCategorias.layoutManager = LinearLayoutManager(this)

        adapter = CategoriaCheckAdapter(listaCategorias)
        recyclerCategorias.adapter = adapter

        findViewById<Button>(R.id.btnGuardarCategorias).setOnClickListener {
            guardarCategorias()
        }

        cargarCategorias()
    }

    private fun cargarCategorias() {
        RetrofitClient.instance.obtenerCategorias().enqueue(object : Callback<List<Categoria>> {
            override fun onResponse(call: Call<List<Categoria>>, response: Response<List<Categoria>>) {
                if (response.isSuccessful) {
                    listaCategorias.clear()
                    listaCategorias.addAll(response.body() ?: emptyList())
                    adapter.notifyDataSetChanged()

                    // 🚀 Paso 2: cargar las categorías seleccionadas de este producto
                    idProducto?.let { cargarCategoriasDeProducto(it) }
                } else {
                    Toast.makeText(this@ProductoCategoriaActivity, "Error al cargar categorías", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Categoria>>, t: Throwable) {
                Toast.makeText(this@ProductoCategoriaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun cargarCategoriasDeProducto(idProducto: Int) {
        RetrofitClient.instance.getCategoriasPorProducto(idProducto)
            .enqueue(object : Callback<List<Int>> {
                override fun onResponse(call: Call<List<Int>>, response: Response<List<Int>>) {
                    if (response.isSuccessful) {
                        val idsSeleccionadas = response.body() ?: emptyList()
                        adapter.setSeleccionadas(idsSeleccionadas) // 🚀 marcar los checkboxes
                    }
                }

                override fun onFailure(call: Call<List<Int>>, t: Throwable) {
                    Toast.makeText(this@ProductoCategoriaActivity, "Fallo al cargar categorías del producto: ${t.message}", Toast.LENGTH_LONG).show()
                }
            })
    }

    private fun guardarCategorias() {
        val seleccionadas = adapter.getCategoriasSeleccionadas()
        val body = mapOf("categorias" to seleccionadas)

        RetrofitClient.instance.syncCategorias(idProducto!!, body)
            .enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ProductoCategoriaActivity, "Categorías actualizadas", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@ProductoCategoriaActivity, "Error al guardar", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ProductoCategoriaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
                }
            })
    }
}
