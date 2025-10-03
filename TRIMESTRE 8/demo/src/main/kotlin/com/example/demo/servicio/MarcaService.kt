package com.example.demo.servicio

import com.example.demo.modelo.Marca
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Service
import org.springframework.jdbc.support.GeneratedKeyHolder
import java.sql.ResultSet
import java.sql.Statement
import org.springframework.dao.EmptyResultDataAccessException

@Service
class MarcaService {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    // Mapeo de Marca
    private val marcaRowMapper = RowMapper<Marca> { rs: ResultSet, _ ->
        Marca(
            idMarca = rs.getInt("idMarca"),
            nombreMarca = rs.getString("nombreMarca")
        )
    }

    // ✅ GET todas
    fun obtenerTodasLasMarcas(): List<Marca> {
        val sql = "SELECT idMarca, nombreMarca FROM marca"
        return jdbcTemplate.query(sql, marcaRowMapper)
    }

    // ✅ GET por id
    fun obtenerMarcaPorId(id: Int): Marca? {
        val sql = "SELECT idMarca, nombreMarca FROM marca WHERE idMarca = ?"
        return try {
            jdbcTemplate.queryForObject(sql, marcaRowMapper, id)
        } catch (e: EmptyResultDataAccessException) {
            null
        }
    }

    // ✅ POST nueva marca
    fun crearMarca(marca: Marca): Marca {
        val sql = "INSERT INTO marca (nombreMarca) VALUES (?)"
        val keyHolder = GeneratedKeyHolder()

        jdbcTemplate.update({ connection ->
            val ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
            ps.setString(1, marca.nombreMarca)
            ps
        }, keyHolder)

        val generatedId = keyHolder.key?.toInt()
        return if (generatedId != null) {
            marca.copy(idMarca = generatedId)
        } else {
            throw RuntimeException("No se pudo obtener el ID de la marca creada.")
        }
    }

    // ✅ PUT actualizar completa
    fun actualizarMarca(marca: Marca): Boolean {
        val sql = "UPDATE marca SET nombreMarca = ? WHERE idMarca = ?"
        val rowsAffected = jdbcTemplate.update(sql, marca.nombreMarca, marca.idMarca)
        return rowsAffected > 0
    }

    // ✅ PATCH actualizar parcial
    fun actualizarParcialmenteMarca(id: Int, campos: Map<String, Any>): Boolean {
        if (campos.isEmpty()) return false

        val setClauses = mutableListOf<String>()
        val params = mutableListOf<Any>()

        for ((key, value) in campos) {
            setClauses.add("$key = ?")
            params.add(value)
        }

        val sql = "UPDATE marca SET ${setClauses.joinToString(", ")} WHERE idMarca = ?"
        params.add(id)

        val rowsAffected = jdbcTemplate.update(sql, *params.toTypedArray())
        return rowsAffected > 0
    }

    // ✅ DELETE
    fun eliminarMarca(id: Int): Boolean {
        val sql = "DELETE FROM marca WHERE idMarca = ?"
        val rowsAffected = jdbcTemplate.update(sql, id)
        return rowsAffected > 0
    }
}
