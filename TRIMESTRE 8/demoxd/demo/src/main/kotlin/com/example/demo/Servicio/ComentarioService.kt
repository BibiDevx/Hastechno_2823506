package com.example.demo.Servicio

import com.example.demo.Modelo.Comentario
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Service
import java.sql.ResultSet

@Service
class ComentarioService {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val avisoRowMapper= RowMapper<Comentario>{ rs: ResultSet, _ ->
        Comentario(
            idComentario=rs.getInt("idComentario"),
            idAviso=rs.getInt("idAviso"),
            idUsuario=rs.getInt("idUsuario"),
            contenido=rs.getString("contenido")
        )
    }
}