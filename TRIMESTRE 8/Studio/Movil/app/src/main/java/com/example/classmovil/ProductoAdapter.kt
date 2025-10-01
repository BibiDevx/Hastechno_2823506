package com.example.classmovil

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ProductoAdapter(
    private val productos: List<Producto>,
    private val onEditarClick: (Producto) -> Unit,
    private val onEliminarClick: (Producto) -> Unit,
    private val onCategoriasClick: (Producto) -> Unit
) : RecyclerView.Adapter<ProductoAdapter.ProductoViewHolder>() {

    class ProductoViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val nombre: TextView = itemView.findViewById(R.id.txtNombre)
        val precio: TextView = itemView.findViewById(R.id.txtPrecio)
        val stock: TextView = itemView.findViewById(R.id.txtStock)
        val btnEditar: Button = itemView.findViewById(R.id.btnEditar)
        val btnEliminar: Button = itemView.findViewById(R.id.btnEliminar)
        val btnCategorias: Button = itemView.findViewById(R.id.btnCategorias)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductoViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_producto, parent, false)
        return ProductoViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProductoViewHolder, position: Int) {
        val producto = productos[position]
        holder.nombre.text = producto.nombreProducto
        holder.precio.text = "$${producto.valorProducto}"
        holder.stock.text = "Stock: ${producto.cantidadStock}"

        holder.btnEditar.setOnClickListener { onEditarClick(producto) }
        holder.btnEliminar.setOnClickListener { onEliminarClick(producto) }
        holder.btnCategorias.setOnClickListener { onCategoriasClick(producto) }
    }

    override fun getItemCount(): Int = productos.size
}