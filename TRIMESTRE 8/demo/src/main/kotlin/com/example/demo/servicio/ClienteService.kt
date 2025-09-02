package com.example.demo.servicio

import com.example.demo.modelo.Cliente
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Service
import java.sql.ResultSet
import java.sql.Statement

@Service
class ClienteService(private val jdbcTemplate: JdbcTemplate) {

    private val clienteRowMapper = RowMapper<Cliente> { rs: ResultSet, _ ->
        Cliente(
            idCliente = rs.getInt("idCliente"),
            idUsuario = rs.getInt("idUsuario"),
            cedulaCliente = rs.getInt("cedulaCliente"),
            nombreCliente = rs.getString("nombreCliente"),
            apellidoCliente = rs.getString("apellidoCliente"),
            telefonoCliente = rs.getString("telefonoCliente"),
            direccion = rs.getString("direccion")
        )
    }

    fun crearCliente(cliente: Cliente): Cliente {
        val sql = "INSERT INTO cliente (idUsuario, cedulaCliente, nombreCliente, apellidoCliente, telefonoCliente, direccion) VALUES (?, ?, ?, ?, ?, ?)"
        val keyHolder = GeneratedKeyHolder()

        jdbcTemplate.update({ connection ->
            val ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
            ps.setInt(1, cliente.idUsuario!!)
            ps.setInt(2, cliente.cedulaCliente)
            ps.setString(3, cliente.nombreCliente)
            ps.setString(4, cliente.apellidoCliente)
            ps.setString(5, cliente.telefonoCliente)
            ps.setString(6, cliente.direccion)
            ps
        }, keyHolder)

        val generatedId = keyHolder.key?.toInt()
        return if (generatedId != null) {
            cliente.copy(idCliente = generatedId)
        } else {
            throw RuntimeException("No se pudo obtener el ID del cliente creado.")
        }
    }
}