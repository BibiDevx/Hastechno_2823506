package com.example.demo.Servicio

import com.example.demo.Modelo.Aviso
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Service
import java.sql.ResultSet

@Service
class AvisoService {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

private val avisoRowMapper= RowMapper<Aviso>{ rs: ResultSet, _ ->
        Aviso(
             idAviso=rs.getInt("idAviso"),
             idUsuario=rs.getInt("idUsuario"),
            titulo=rs.getString("titulo"),
            contenido=rs.getString("contenido"),
            estado=rs.getString("estado")
        )
    }
}