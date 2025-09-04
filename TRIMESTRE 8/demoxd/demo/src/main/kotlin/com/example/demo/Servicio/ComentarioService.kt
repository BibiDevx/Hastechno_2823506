package com.example.demo.Servicio

import com.example.demo.Modelo.comentarios
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import java.sql.ResultSet

class ComentarioService {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val avisoRowMapper= RowMapper<comentarios>{ rs: ResultSet, _ ->
        comentarios(
            idComentario=rs.getInt("idComentario"),
            idAviso=rs.getInt("idAviso"),
            idUsuario=rs.getInt("idUsuario"),
            contenido=rs.getString("contenido")
        )
    }
}