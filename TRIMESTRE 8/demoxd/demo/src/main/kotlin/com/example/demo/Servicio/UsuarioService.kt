package com.example.demo.Servicio

import com.example.demo.Modelo.Usuario
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Service
import java.sql.ResultSet

@Service
class UsuarioService {
    
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val usuarioRowMapper= RowMapper<Usuario>{ rs: ResultSet, _ ->
        Usuario(
            idUsuario = rs.getInt("idUsuarios"),
            email=rs.getString("email"),
            password=rs.getString("password"),
            nombre=rs.getString("nombre"),
            cedula=rs.getInt("cedula"),
            direccion=rs.getString("direccion"),
            telefono=rs.getString("telefono")
        )
    }
    fun crearUsuario(usuario: Usuario): Usuario {
        val sql = "INSERT INTO usuarios (email, password, nombre, cedula, direccion, telefono) VALUES (?, ?, ?, ?, ?, ?)"
        jdbcTemplate.update(sql, usuario.email, usuario.password, usuario.nombre, usuario.cedula, usuario.direccion, usuario.telefono)
        return usuario
    }

    fun buscarPorId(id: Int): Usuario? {
        val sql = "SELECT * FROM usuarios WHERE idUsuarios = ?"
        return jdbcTemplate.queryForObject(sql, usuarioRowMapper, id)
    }

    fun listarTodos(): List<Usuario> {
        val sql = "SELECT * FROM usuarios"
        return jdbcTemplate.query(sql, usuarioRowMapper)
    }

    fun actualizarUsuario(usuario: Usuario) {
        val sql = "UPDATE usuarios SET email = ?, password = ?, nombre = ?, cedula = ?, direccion = ?, telefono = ? WHERE idUsuarios = ?"
        jdbcTemplate.update(sql, usuario.email, usuario.password, usuario.nombre, usuario.cedula, usuario.direccion, usuario.telefono, usuario.idUsuario)
    }

    fun eliminarUsuario(id: Int) {
        val sql = "DELETE FROM usuarios WHERE idUsuarios = ?"
        jdbcTemplate.update(sql, id)
    }
}