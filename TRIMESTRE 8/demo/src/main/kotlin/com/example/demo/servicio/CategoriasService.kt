package com.example.demo.servicio

import com.example.demo.modelo.Categoria
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Service
import org.springframework.jdbc.support.GeneratedKeyHolder
import java.sql.ResultSet
import java.sql.Statement
import org.springframework.dao.EmptyResultDataAccessException

@Service
class CategoriaService {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    // Mapper de Categoria
    private val categoriaRowMapper = RowMapper<Categoria> { rs: ResultSet, _ ->
        Categoria(
            idCategoria = rs.getInt("idCategoria"),
            nombreCategoria = rs.getString("nombreCategoria")
        )
    }

    // ✅ GET todas las categorías
    fun obtenerTodasLasCategorias(): List<Categoria> {
        val sql = "SELECT idCategoria, nombreCategoria FROM categoria"
        return jdbcTemplate.query(sql, categoriaRowMapper)
    }

    // ✅ GET por id
    fun obtenerCategoriaPorId(id: Int): Categoria? {
        val sql = "SELECT idCategoria, nombreCategoria FROM categoria WHERE idCategoria = ?"
        return try {
            jdbcTemplate.queryForObject(sql, categoriaRowMapper, id)
        } catch (e: EmptyResultDataAccessException) {
            null
        }
    }

    // ✅ POST nueva categoría
    fun crearCategoria(categoria: Categoria): Categoria {
        val sql = "INSERT INTO categoria (nombreCategoria) VALUES (?)"
        val keyHolder = GeneratedKeyHolder()

        jdbcTemplate.update({ connection ->
            val ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
            ps.setString(1, categoria.nombreCategoria)
            ps
        }, keyHolder)

        val generatedId = keyHolder.key?.toInt()
        return if (generatedId != null) {
            categoria.copy(idCategoria = generatedId)
        } else {
            throw RuntimeException("No se pudo obtener el ID de la categoría creada.")
        }
    }

    // ✅ PUT actualizar completa
    fun actualizarCategoria(categoria: Categoria): Boolean {
        val sql = "UPDATE categoria SET nombreCategoria = ? WHERE idCategoria = ?"
        val rowsAffected = jdbcTemplate.update(sql, categoria.nombreCategoria, categoria.idCategoria)
        return rowsAffected > 0
    }

    // ✅ PATCH actualizar parcial
    fun actualizarParcialmenteCategoria(id: Int, campos: Map<String, Any>): Boolean {
        if (campos.isEmpty()) return false

        val setClauses = mutableListOf<String>()
        val params = mutableListOf<Any>()

        for ((key, value) in campos) {
            setClauses.add("$key = ?")
            params.add(value)
        }

        val sql = "UPDATE categoria SET ${setClauses.joinToString(", ")} WHERE idCategoria = ?"
        params.add(id)

        val rowsAffected = jdbcTemplate.update(sql, *params.toTypedArray())
        return rowsAffected > 0
    }

    // ✅ DELETE
    fun eliminarCategoria(id: Int): Boolean {
        val sql = "DELETE FROM categoria WHERE idCategoria = ?"
        val rowsAffected = jdbcTemplate.update(sql, id)
        return rowsAffected > 0
    }
}
