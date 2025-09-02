package com.example.demo.servicio

import com.example.demo.modelo.Rol
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Service
import java.sql.ResultSet

@Service
class RolService(private val jdbcTemplate: JdbcTemplate) {

    private val rolRowMapper = RowMapper<Rol> { rs: ResultSet, _ ->
        Rol(
            idRol = rs.getInt("idRol"),
            nombreRol = rs.getString("nombreRol")
        )
    }

    fun buscarRolPorNombre(nombreRol: String): Rol? {
        val sql = "SELECT idRol, nombreRol FROM rol WHERE nombreRol = ?"
        return try {
            jdbcTemplate.queryForObject(sql, rolRowMapper, nombreRol)
        } catch (e: EmptyResultDataAccessException) {
            null
        }
    }

    fun crearRol(nombreRol: String): Rol {
        val sql = "INSERT INTO rol (nombreRol) VALUES (?)"
        jdbcTemplate.update(sql, nombreRol)
        val nuevoRol = buscarRolPorNombre(nombreRol)
        return nuevoRol ?: throw RuntimeException("No se pudo crear el rol.")
    }

    fun obtenerOcrearRol(nombreRol: String): Rol {
        return buscarRolPorNombre(nombreRol) ?: crearRol(nombreRol)
    }
}