package com.example.classmovil.vista.marca

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
import com.example.classmovil.modelo.Marca
import com.google.android.material.floatingactionbutton.FloatingActionButton
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MarcaActivity : AppCompatActivity() {

    private lateinit var recyclerMarcas: RecyclerView
    private lateinit var adapter: MarcaAdapter
    private var listaMarcas = mutableListOf<Marca>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_marca)

        recyclerMarcas = findViewById(R.id.recyclerMarcas)
        recyclerMarcas.layoutManager = LinearLayoutManager(this)

        adapter = MarcaAdapter(
            listaMarcas,
            onEditarClick = { marca -> mostrarDialogoMarca(marca) },
            onEliminarClick = { marca -> eliminarMarca(marca) }
        )
        recyclerMarcas.adapter = adapter

        val fab = findViewById<FloatingActionButton>(R.id.fabAgregarMarca)
        fab.setOnClickListener { mostrarDialogoMarca() }

        cargarMarcas()
    }

    private fun cargarMarcas() {
        RetrofitClient.instance.obtenerMarcas().enqueue(object : Callback<List<Marca>> {
            override fun onResponse(call: Call<List<Marca>>, response: Response<List<Marca>>) {
                if (response.isSuccessful) {
                    listaMarcas.clear()
                    listaMarcas.addAll(response.body() ?: emptyList())
                    adapter.notifyDataSetChanged()
                } else {
                    Toast.makeText(this@MarcaActivity, "Error al cargar marcas", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Marca>>, t: Throwable) {
                Toast.makeText(this@MarcaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun mostrarDialogoMarca(marca: Marca? = null) {
        val builder = AlertDialog.Builder(this)
        val inflater = LayoutInflater.from(this)
        val view = inflater.inflate(R.layout.dialog_marca, null)

        val inputNombre = view.findViewById<EditText>(R.id.inputNombreMarca)

        if (marca != null) {
            inputNombre.setText(marca.nombreMarca)
        }

        builder.setView(view)
            .setTitle(if (marca == null) "Agregar Marca" else "Editar Marca")
            .setPositiveButton("Guardar") { dialog, _ ->
                val nuevaMarca = Marca(
                    idMarca = marca?.idMarca,
                    nombreMarca = inputNombre.text.toString()
                )

                if (marca == null) {
                    crearMarca(nuevaMarca)
                } else {
                    actualizarMarca(nuevaMarca)
                }

                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ -> dialog.dismiss() }

        builder.create().show()
    }

    private fun crearMarca(marca: Marca) {
        RetrofitClient.instance.crearMarca(marca).enqueue(object : Callback<Marca> {
            override fun onResponse(call: Call<Marca>, response: Response<Marca>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MarcaActivity, "Marca agregada", Toast.LENGTH_SHORT).show()
                    cargarMarcas()
                } else {
                    Toast.makeText(this@MarcaActivity, "Error al agregar", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Marca>, t: Throwable) {
                Toast.makeText(this@MarcaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun actualizarMarca(marca: Marca) {
        val id = marca.idMarca ?: return
        RetrofitClient.instance.actualizarMarca(id, marca).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MarcaActivity, "Marca actualizada", Toast.LENGTH_SHORT).show()
                    cargarMarcas()
                } else {
                    Toast.makeText(this@MarcaActivity, "Error al actualizar", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@MarcaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun eliminarMarca(marca: Marca) {
        val id = marca.idMarca ?: return
        RetrofitClient.instance.eliminarMarca(id).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MarcaActivity, "Marca eliminada", Toast.LENGTH_SHORT).show()
                    cargarMarcas()
                } else {
                    Toast.makeText(this@MarcaActivity, "Error al eliminar", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@MarcaActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }
}
