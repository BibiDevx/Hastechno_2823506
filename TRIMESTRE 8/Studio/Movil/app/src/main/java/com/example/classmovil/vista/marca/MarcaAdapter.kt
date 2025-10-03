package com.example.classmovil.vista.marca

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.classmovil.R
import com.example.classmovil.modelo.Marca

class MarcaAdapter(
    private val marcas: MutableList<Marca>,
    private val onEditarClick: (Marca) -> Unit,
    private val onEliminarClick: (Marca) -> Unit
) : RecyclerView.Adapter<MarcaAdapter.MarcaViewHolder>() {

    class MarcaViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val txtNombre: TextView = view.findViewById(R.id.txtNombreMarca)
        val btnEditar: ImageButton = view.findViewById(R.id.btnEditarMarca)
        val btnEliminar: ImageButton = view.findViewById(R.id.btnEliminarMarca)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MarcaViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_marca, parent, false)
        return MarcaViewHolder(view)
    }

    override fun onBindViewHolder(holder: MarcaViewHolder, position: Int) {
        val marca = marcas[position]
        holder.txtNombre.text = marca.nombreMarca

        holder.btnEditar.setOnClickListener { onEditarClick(marca) }
        holder.btnEliminar.setOnClickListener { onEliminarClick(marca) }
    }

    override fun getItemCount(): Int = marcas.size
}
