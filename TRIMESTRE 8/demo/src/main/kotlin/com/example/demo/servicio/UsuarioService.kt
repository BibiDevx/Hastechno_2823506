package com.example.demo.servicio

import com.example.demo.modelo.Usuario
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import com.example.demo.request.AdminUpdateRequest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.sql.ResultSet

@Service
class UsuarioService(
    private val jdbcTemplate: JdbcTemplate,
    private val rolService: RolService,
    private val passwordEncoder: PasswordEncoder
) {

    private val usuarioRowMapper = RowMapper<Usuario> { rs: ResultSet, _ ->
        Usuario(
            idUsuario = rs.getInt("idUsuario"),
            email = rs.getString("email"),
            password = rs.getString("password"),
            idRol = rs.getInt("idRol")
        )
    }

    fun crearOencontrarUsuario(nombreRol: String, email: String, password: String): Usuario {
        val rol = rolService.obtenerOcrearRol(nombreRol)
        val usuarioExistente = obtenerUsuarioPorEmail(email)

        if (usuarioExistente != null) {
            if (usuarioExistente.idRol != rol.idRol) {
                throw RuntimeException("El usuario ya existe con otro rol")
            }
            return usuarioExistente
        }

        val hashedPassword = passwordEncoder.encode(password)
        val sql = "INSERT INTO usuario (idRol, email, password) VALUES (?, ?, ?)"
        jdbcTemplate.update(sql, rol.idRol, email, hashedPassword)
        val nuevoUsuario = obtenerUsuarioPorEmail(email)
        return nuevoUsuario ?: throw RuntimeException("No se pudo crear el usuario.")
    }

    fun obtenerTodosLosUsuarios(): List<Usuario> {
        val sql = "SELECT idUsuario, idRol, email, password FROM usuario"
        return jdbcTemplate.query(sql, usuarioRowMapper)
    }

    fun obtenerUsuarioPorId(id: Int): Usuario? {
        val sql = "SELECT idUsuario, idRol, email, password FROM usuario WHERE idUsuario = ?"
        return try {
            jdbcTemplate.queryForObject(sql, usuarioRowMapper, id)
        } catch (e: EmptyResultDataAccessException) {
            null
        }
    }

    fun eliminarUsuario(id: Int): Boolean {
        val rowsAffected = jdbcTemplate.update("DELETE FROM usuario WHERE idUsuario = ?", id)
        return rowsAffected > 0
    }

    fun obtenerUsuarioPorEmail(email: String): Usuario? {
        val sql = "SELECT idUsuario, idRol, email, password FROM usuario WHERE email = ?"
        return try {
            jdbcTemplate.queryForObject(sql, usuarioRowMapper, email)
        } catch (e: EmptyResultDataAccessException) {
            null
        }
    }
    fun actualizarRol(idUsuario: Int, idRol: Int): Boolean {
        val sql = "UPDATE usuario SET idRol = ? WHERE idUsuario = ?"
        val rowsAffected = jdbcTemplate.update(sql, idRol, idUsuario)
        return rowsAffected > 0
    }
}