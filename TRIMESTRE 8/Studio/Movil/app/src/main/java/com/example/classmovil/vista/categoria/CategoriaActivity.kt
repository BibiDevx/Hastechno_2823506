package com.example.classmovil.vista.categoria

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.classmovil.R
import com.example.classmovil.RetrofitClient
import com.example.classmovil.modelo.Categoria
import com.google.android.material.floatingactionbutton.FloatingActionButton
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class CategoriaActivity : AppCompatActivity() {

    private lateinit var recyclerCategorias: RecyclerView
    private lateinit var adapter: CategoriaAdapter
    private var listaCategorias = mutableListOf<Categoria>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_categoria)

        recyclerCategorias = findViewById(R.id.recyclerCategorias)
        recyclerCategorias.layoutManager = LinearLayoutManager(this)

        adapter = CategoriaAdapter(
            listaCategorias,
            onEditarClick = { categoria -> mostrarDialogoCategoria(categoria) },
            onEliminarClick = { categoria -> eliminarCategoria(categoria) }
        )
        recyclerCategorias.adapter = adapter

        val fab = findViewById<FloatingActionButton>(R.id.fabAgregarCategoria)
        fab.setOnClickListener { mostrarDialogoCategoria() }

        cargarCategorias()
    }

    private fun cargarCategorias() {
        RetrofitClient.instance.obtenerCategorias().enqueue(object : Callback<List<Categoria>> {
            override fun onResponse(call: Call<List<Categoria>>, response: Response<List<Categoria>>) {
                if (response.isSuccessful) {
                    listaCategorias.clear()
                    listaCategorias.addAll(response.body() ?: emptyList())
                    adapter.notifyDataSetChanged()
                } else {
                    Toast.makeText(this@CategoriaActivity, "Error al cargar categorías", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Categoria>>, t: Throwable) {
                Toast.makeText(this@CategoriaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun mostrarDialogoCategoria(categoria: Categoria? = null) {
        val builder = AlertDialog.Builder(this)
        val inflater = LayoutInflater.from(this)
        val view = inflater.inflate(R.layout.dialog_categoria, null)

        val inputNombre = view.findViewById<EditText>(R.id.inputNombreCategoria)

        if (categoria != null) {
            inputNombre.setText(categoria.nombreCategoria)
        }

        builder.setView(view)
            .setTitle(if (categoria == null) "Agregar Categoría" else "Editar Categoría")
            .setPositiveButton("Guardar") { dialog, _ ->
                val nuevaCategoria = Categoria(
                    idCategoria = categoria?.idCategoria, // si estoy editando, conservo el id
                    nombreCategoria = inputNombre.text.toString()
                )

                if (categoria == null) {
                    crearCategoria(nuevaCategoria)   // crear sin id
                } else {
                    actualizarCategoria(nuevaCategoria) // actualizar con id
                }

                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ -> dialog.dismiss() }

        builder.create().show()
    }

    private fun crearCategoria(categoria: Categoria) {
        RetrofitClient.instance.crearCategoria(categoria).enqueue(object : Callback<Categoria> {
            override fun onResponse(call: Call<Categoria>, response: Response<Categoria>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@CategoriaActivity, "Categoría agregada", Toast.LENGTH_SHORT).show()
                    cargarCategorias()
                } else {
                    Toast.makeText(this@CategoriaActivity, "Error al agregar", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Categoria>, t: Throwable) {
                Toast.makeText(this@CategoriaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun actualizarCategoria(categoria: Categoria) {
        val id = categoria.idCategoria ?: return
        RetrofitClient.instance.actualizarCategoria(id, categoria).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@CategoriaActivity, "Categoría actualizada", Toast.LENGTH_SHORT).show()
                    cargarCategorias()
                } else {
                    Toast.makeText(this@CategoriaActivity, "Error al actualizar", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@CategoriaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun eliminarCategoria(categoria: Categoria) {
        val id = categoria.idCategoria ?: return
        RetrofitClient.instance.eliminarCategoria(id).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@CategoriaActivity, "Categoría eliminada", Toast.LENGTH_SHORT).show()
                    cargarCategorias()
                } else {
                    Toast.makeText(this@CategoriaActivity, "Error al eliminar", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@CategoriaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }
}
