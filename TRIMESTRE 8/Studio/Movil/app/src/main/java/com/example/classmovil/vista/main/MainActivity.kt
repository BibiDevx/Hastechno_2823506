package com.example.classmovil.vista.main

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.CheckBox
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.classmovil.vista.producto.ProductoAdapter
import com.example.classmovil.R
import com.example.classmovil.RetrofitClient
import com.example.classmovil.modelo.Producto
import com.google.android.material.floatingactionbutton.FloatingActionButton
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import android.content.Intent
import com.example.classmovil.vista.categoria.CategoriaActivity
import com.example.classmovil.vista.marca.MarcaActivity
import com.example.classmovil.vista.categoria.ProductoCategoriaActivity
import android.widget.Button

class MainActivity : AppCompatActivity() {

    private lateinit var recyclerProductos: RecyclerView
    private lateinit var adapter: ProductoAdapter
    private var listaProductos = mutableListOf<Producto>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        recyclerProductos = findViewById(R.id.recyclerProductos)
        recyclerProductos.layoutManager = LinearLayoutManager(this)

        adapter = ProductoAdapter(
            listaProductos,
            onEditarClick = { producto -> mostrarDialogoProducto(producto) },
            onEliminarClick = { producto -> eliminarProducto(producto) },
            onCategoriasClick = { producto ->
                val intent = Intent(this, ProductoCategoriaActivity::class.java)
                intent.putExtra("idProducto", producto.idProducto) // Pasar el ID del producto
                startActivity(intent)
            }
        )

        recyclerProductos.adapter = adapter

        val fab = findViewById<FloatingActionButton>(R.id.fabAgregar)
        fab.setOnClickListener { mostrarDialogoProducto() }

        // Cargar productos desde API
        cargarProductos()

        findViewById<Button>(R.id.btnCategorias).setOnClickListener {
            startActivity(Intent(this, CategoriaActivity::class.java))
        }

        findViewById<Button>(R.id.btnMarcas).setOnClickListener {
            startActivity(Intent(this, MarcaActivity::class.java))
        }
    }

    private fun cargarProductos() {
        RetrofitClient.instance.obtenerProductos().enqueue(object : Callback<List<Producto>> {
            override fun onResponse(call: Call<List<Producto>>, response: Response<List<Producto>>) {
                if (response.isSuccessful) {
                    listaProductos.clear()
                    listaProductos.addAll(response.body() ?: emptyList())
                    adapter.notifyDataSetChanged()
                } else {
                    Toast.makeText(this@MainActivity, "Error al cargar productos", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Producto>>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun mostrarDialogoProducto(producto: Producto? = null) {
        val builder = AlertDialog.Builder(this)
        val inflater = LayoutInflater.from(this)
        val view = inflater.inflate(R.layout.dialog_producto, null)

        val inputNombre = view.findViewById<EditText>(R.id.inputNombre)
        val inputDescripcion = view.findViewById<EditText>(R.id.inputDescripcion)
        val inputValor = view.findViewById<EditText>(R.id.inputValor)
        val inputStock = view.findViewById<EditText>(R.id.inputStock)
        val checkDisponible = view.findViewById<CheckBox>(R.id.checkDisponible)

        if (producto != null) {
            inputNombre.setText(producto.nombreProducto)
            inputDescripcion.setText(producto.definicion)
            inputValor.setText(producto.valorProducto.toString())
            inputStock.setText(producto.cantidadStock.toString())
            checkDisponible.isChecked = producto.disponibilidad
        }

        builder.setView(view)
            .setTitle(if (producto == null) "Agregar Producto" else "Editar Producto")
            .setPositiveButton("Guardar") { dialog, _ ->
                val nuevoProducto = Producto(
                    idProducto = producto?.idProducto,
                    nombreProducto = inputNombre.text.toString(),
                    definicion = inputDescripcion.text.toString(),
                    idMarca = 1,
                    valorProducto = inputValor.text.toString().toIntOrNull() ?: 0,
                    disponibilidad = checkDisponible.isChecked,
                    cantidadStock = inputStock.text.toString().toIntOrNull() ?: 0,
                    idProveedor = 1
                )

                if (producto == null) {
                    crearProducto(nuevoProducto)
                } else {
                    actualizarProducto(nuevoProducto)
                }

                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ -> dialog.dismiss() }

        builder.create().show()
    }

    private fun crearProducto(producto: Producto) {
        RetrofitClient.instance.crearProducto(producto).enqueue(object : Callback<Producto> {
            override fun onResponse(call: Call<Producto>, response: Response<Producto>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MainActivity, "Producto agregado", Toast.LENGTH_SHORT).show()
                    cargarProductos()
                } else {
                    Toast.makeText(this@MainActivity, "Error al agregar", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Producto>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun actualizarProducto(producto: Producto) {
        val id = producto.idProducto ?: return
        RetrofitClient.instance.actualizarProducto(id, producto).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MainActivity, "Producto actualizado", Toast.LENGTH_SHORT).show()
                    cargarProductos()
                } else {
                    Toast.makeText(this@MainActivity, "Error al actualizar", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun eliminarProducto(producto: Producto) {
        val id = producto.idProducto ?: return
        RetrofitClient.instance.eliminarProducto(id).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MainActivity, "Producto eliminado", Toast.LENGTH_SHORT).show()
                    cargarProductos()
                } else {
                    Toast.makeText(this@MainActivity, "Error al eliminar", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Fallo: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }
}