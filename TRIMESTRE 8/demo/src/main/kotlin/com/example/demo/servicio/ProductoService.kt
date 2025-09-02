package com.example.demo.servicio

import com.example.demo.modelo.Producto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Service
import java.sql.ResultSet
import java.sql.Statement
import org.springframework.dao.EmptyResultDataAccessException

@Service
class ProductoService {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    //Get De Productos
    private val productoRowMapper = RowMapper<Producto> { rs: ResultSet, _ ->
        Producto(
            idProducto = rs.getInt("idProducto"),
            nombreProducto = rs.getString("nombreProducto"),
            definicion = rs.getString("definicion"),
            idMarca = rs.getInt("idMarca"),
            valorProducto = rs.getInt("valorProducto"),
            disponibilidad = rs.getBoolean("disponibilidad"),
            cantidadStock = rs.getInt("cantidadStock"),
            idProveedor = rs.getInt("idProveedor")
        )
    }
    fun obtenerTodosLosProductos(): List<Producto> {
        val sql = "SELECT idProducto, nombreProducto, definicion, idMarca, valorProducto, disponibilidad, cantidadStock, idProveedor FROM producto"
        return jdbcTemplate.query(sql, productoRowMapper)
    }
    fun obtenerProductoPorId(id: Int): Producto? {
        val sql = "SELECT * FROM producto WHERE idProducto = ?"
        return try {
            jdbcTemplate.queryForObject(sql, productoRowMapper, id)
        } catch (e: EmptyResultDataAccessException) {
            null
        }
    }
    //Post de Productos
    fun crearProducto(producto: Producto): Producto {
        val sql =
            "INSERT INTO producto (nombreProducto, definicion, idMarca, valorProducto, disponibilidad, cantidadStock, idProveedor) VALUES (?, ?, ?, ?, ?, ?, ?)"
        val keyHolder = GeneratedKeyHolder()

        jdbcTemplate.update({ connection ->
            val ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
            ps.setString(1, producto.nombreProducto)
            ps.setString(2, producto.definicion)
            ps.setInt(3, producto.idMarca)
            ps.setInt(4, producto.valorProducto)
            ps.setBoolean(5, producto.disponibilidad)
            ps.setInt(6, producto.cantidadStock)
            ps.setInt(7, producto.idProveedor)
            ps
        }, keyHolder)
        val generatedId = keyHolder.key?.toInt()

        return if (generatedId != null) {
            producto.copy(idProducto = generatedId)
        } else {
            throw RuntimeException("No se pudo obtener el ID del producto creado.")
        }
    }
    //Put
    fun actualizarProducto(producto: Producto): Boolean {
        val sql = "UPDATE producto SET nombreProducto = ?, definicion = ?, idMarca = ?, valorProducto = ?, disponibilidad = ?, cantidadStock = ?, idProveedor = ? WHERE idProducto = ?"

        val rowsAffected = jdbcTemplate.update(sql,
            producto.nombreProducto,
            producto.definicion,
            producto.idMarca,
            producto.valorProducto,
            producto.disponibilidad,
            producto.cantidadStock,
            producto.idProveedor,
            producto.idProducto
        )
        return rowsAffected > 0
    }
    fun actualizarParcialmenteProducto(id: Int, campos: Map<String, Any>): Boolean {
        if (campos.isEmpty()) {
            return false
        }

        val setClauses = mutableListOf<String>()
        val params = mutableListOf<Any>()

        for ((key, value) in campos) {
            setClauses.add("$key = ?")
            params.add(value)
        }

        val sql = "UPDATE producto SET ${setClauses.joinToString(", ")} WHERE idProducto = ?"
        params.add(id)

        val rowsAffected = jdbcTemplate.update(sql, *params.toTypedArray())

        return rowsAffected > 0
    }
    fun eliminarProducto(id: Int): Boolean {
        val sql = "DELETE FROM producto WHERE idProducto = ?"
        val rowsAffected = jdbcTemplate.update(sql, id)
        return rowsAffected > 0
    }

}