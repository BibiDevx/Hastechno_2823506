package com.example.demo.Servicio

import com.example.demo.Modelo.usuarios
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import java.sql.ResultSet

class UsuarioService {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val avisoRowMapper= RowMapper<usuarios>{ rs: ResultSet, _ ->
        usuarios(
            idUsuarios=rs.getInt("idUsuarios"),
            email=rs.getString("email"),
            nombre=rs.getString("nombre"),
            cedula=rs.getInt("cedula"),
            direccion=rs.getString("direccion"),
            telefono=rs.getString("telefono")
        )
    }
}