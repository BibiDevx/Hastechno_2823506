package com.example.demo.servicio

import com.example.demo.modelo.Admin
import com.example.demo.controlador.AdminConUsuarioDTO
import com.example.demo.request.AdminUpdateRequest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Service
import org.springframework.dao.EmptyResultDataAccessException
import java.sql.Statement
import org.springframework.transaction.annotation.Transactional

@Service
class AdminService(private val jdbcTemplate: JdbcTemplate) {

    fun crearAdmin(admin: Admin): Admin {
        val sql = "INSERT INTO admin (idUsuario, nombreAdmin, apellidoAdmin, cedulaAdmin, telefonoAdmin) VALUES (?, ?, ?, ?, ?)"
        val keyHolder = GeneratedKeyHolder()

        jdbcTemplate.update({ connection ->
            val ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
            ps.setInt(1, admin.idUsuario!!)
            ps.setString(2, admin.nombreAdmin)
            ps.setString(3, admin.apellidoAdmin)
            ps.setInt(4, admin.cedulaAdmin)
            ps.setString(5, admin.telefonoAdmin)
            ps
        }, keyHolder)

        val generatedId = keyHolder.key?.toInt()
        return if (generatedId != null) {
            admin.copy(idAdmin = generatedId)
        } else {
            throw RuntimeException("No se pudo obtener el ID del admin creado.")
        }
    }
    fun obtenerTodosLosAdminsConUsuario(): List<AdminConUsuarioDTO> {
        val sql = """
            SELECT
                a.idAdmin, a.idUsuario, a.cedulaAdmin, a.nombreAdmin, a.apellidoAdmin, a.telefonoAdmin,
                u.email
            FROM admin a
            JOIN usuario u ON a.idUsuario = u.idUsuario
        """.trimIndent()
        return jdbcTemplate.query(sql) { rs, _ ->
            AdminConUsuarioDTO(
                idAdmin = rs.getInt("idAdmin"),
                idUsuario = rs.getInt("idUsuario"),
                cedulaAdmin = rs.getInt("cedulaAdmin"),
                nombreAdmin = rs.getString("nombreAdmin"),
                apellidoAdmin = rs.getString("apellidoAdmin"),
                telefonoAdmin = rs.getString("telefonoAdmin"),
                email = rs.getString("email")
            )
        }
    }

    fun obtenerAdminPorIdConUsuario(id: Int): AdminConUsuarioDTO? {
        val sql = """
            SELECT
                a.idAdmin, a.idUsuario, a.cedulaAdmin, a.nombreAdmin, a.apellidoAdmin, a.telefonoAdmin,
                u.email
            FROM admin a
            JOIN usuario u ON a.idUsuario = u.idUsuario
            WHERE a.idAdmin = ?
        """.trimIndent()
        return try {
            jdbcTemplate.queryForObject(sql, { rs, _ ->
                AdminConUsuarioDTO(
                    idAdmin = rs.getInt("idAdmin"),
                    idUsuario = rs.getInt("idUsuario"),
                    cedulaAdmin = rs.getInt("cedulaAdmin"),
                    nombreAdmin = rs.getString("nombreAdmin"),
                    apellidoAdmin = rs.getString("apellidoAdmin"),
                    telefonoAdmin = rs.getString("telefonoAdmin"),
                    email = rs.getString("email")
                )
            }, id)
        } catch (e: EmptyResultDataAccessException) {
            null
        }
    }

    @Transactional
    fun actualizarPerfil(idUsuario: Int, request: AdminUpdateRequest): Boolean {

        val updateAdminSql = "UPDATE admin SET nombreAdmin = COALESCE(?, nombreAdmin), apellidoAdmin = COALESCE(?, apellidoAdmin), cedulaAdmin = COALESCE(?, cedulaAdmin), telefonoAdmin = COALESCE(?, telefonoAdmin) WHERE idUsuario = ?"
        val adminRowsAffected = jdbcTemplate.update(updateAdminSql,
            request.nombreAdmin, request.apellidoAdmin, request.cedulaAdmin, request.telefonoAdmin, idUsuario
        )

        var usuarioRowsAffected = 0
        if (request.email != null || request.password != null) {
            val updateUsuarioSql = "UPDATE usuario SET email = COALESCE(?, email), password = COALESCE(?, password) WHERE idUsuario = ?"
            usuarioRowsAffected = jdbcTemplate.update(updateUsuarioSql, request.email, request.password, idUsuario)
        }

        return adminRowsAffected > 0 || usuarioRowsAffected > 0
    }

    @Transactional
    fun actualizarAdminPorId(idAdmin: Int, request: AdminUpdateRequest): Boolean {
        val admin = obtenerAdminPorIdConUsuario(idAdmin) ?: return false
        val idUsuario = admin.idUsuario!!

        val updateAdminSql = "UPDATE admin SET nombreAdmin = COALESCE(?, nombreAdmin), apellidoAdmin = COALESCE(?, apellidoAdmin), cedulaAdmin = COALESCE(?, cedulaAdmin), telefonoAdmin = COALESCE(?, telefonoAdmin) WHERE idAdmin = ?"
        val adminRowsAffected = jdbcTemplate.update(updateAdminSql,
            request.nombreAdmin, request.apellidoAdmin, request.cedulaAdmin, request.telefonoAdmin, idAdmin
        )

        var usuarioRowsAffected = 0
        if (request.email != null || request.password != null || request.idRol != null) {
            val updateUsuarioSql = "UPDATE usuario SET email = COALESCE(?, email), password = COALESCE(?, password), idRol = COALESCE(?, idRol) WHERE idUsuario = ?"
            usuarioRowsAffected = jdbcTemplate.update(updateUsuarioSql, request.email, request.password, request.idRol, idUsuario)
        }

        return adminRowsAffected > 0 || usuarioRowsAffected > 0
    }

    @Transactional
    fun eliminarAdmin(idAdmin: Int): Boolean {
        val admin = obtenerAdminPorIdConUsuario(idAdmin) ?: return false

        val deleteAdminSql = "DELETE FROM admin WHERE idAdmin = ?"
        val adminRowsAffected = jdbcTemplate.update(deleteAdminSql, idAdmin)

        val deleteUsuarioSql = "DELETE FROM usuario WHERE idUsuario = ?"
        val usuarioRowsAffected = jdbcTemplate.update(deleteUsuarioSql, admin.idUsuario)

        return adminRowsAffected > 0 && usuarioRowsAffected > 0
    }
}