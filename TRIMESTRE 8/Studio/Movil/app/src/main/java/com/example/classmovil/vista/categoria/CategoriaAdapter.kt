package com.example.classmovil.vista.categoria

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.classmovil.R
import com.example.classmovil.modelo.Categoria

class CategoriaAdapter(
    private val categorias: MutableList<Categoria>,
    private val onEditarClick: (Categoria) -> Unit,
    private val onEliminarClick: (Categoria) -> Unit
) : RecyclerView.Adapter<CategoriaAdapter.CategoriaViewHolder>() {

    class CategoriaViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val txtNombre: TextView = view.findViewById(R.id.txtNombreCategoria)
        val btnEditar: ImageButton = view.findViewById(R.id.btnEditarCategoria)
        val btnEliminar: ImageButton = view.findViewById(R.id.btnEliminarCategoria)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategoriaViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_categoria, parent, false)
        return CategoriaViewHolder(view)
    }

    override fun onBindViewHolder(holder: CategoriaViewHolder, position: Int) {
        val categoria = categorias[position]
        holder.txtNombre.text = categoria.nombreCategoria

        holder.btnEditar.setOnClickListener { onEditarClick(categoria) }
        holder.btnEliminar.setOnClickListener { onEliminarClick(categoria) }
    }

    override fun getItemCount(): Int = categorias.size
}
