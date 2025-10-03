package com.example.classmovil.vista.categoria

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.classmovil.R
import com.example.classmovil.modelo.Categoria

class CategoriaCheckAdapter(
    private val categorias: List<Categoria>,
    private val seleccionadas: MutableSet<Int> = mutableSetOf()
) : RecyclerView.Adapter<CategoriaCheckAdapter.CategoriaViewHolder>() {

    inner class CategoriaViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val checkBox: CheckBox = itemView.findViewById(R.id.checkCategoria)
        val nombre: TextView = itemView.findViewById(R.id.txtNombreCategoria)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategoriaViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_categoria_check, parent, false)
        return CategoriaViewHolder(view)
    }

    override fun onBindViewHolder(holder: CategoriaViewHolder, position: Int) {
        val categoria = categorias[position]
        holder.nombre.text = categoria.nombreCategoria

        // 🔥 Evitamos que se dispare el listener mientras seteamos el valor
        holder.checkBox.setOnCheckedChangeListener(null)
        holder.checkBox.isChecked = categoria.idCategoria?.let { seleccionadas.contains(it) } ?: false

        holder.checkBox.setOnCheckedChangeListener { _, isChecked ->
            categoria.idCategoria?.let { id ->
                if (isChecked) {
                    seleccionadas.add(id)
                } else {
                    seleccionadas.remove(id)
                }
            }
        }
    }

    override fun getItemCount(): Int = categorias.size

    fun getCategoriasSeleccionadas(): List<Int> = seleccionadas.toList()

    fun setSeleccionadas(ids: List<Int>) {
        seleccionadas.clear()
        seleccionadas.addAll(ids)
        notifyDataSetChanged()
    }
}
