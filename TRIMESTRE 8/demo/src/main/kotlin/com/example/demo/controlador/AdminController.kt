package com.example.demo.controlador

import com.example.demo.modelo.Admin
import com.example.demo.request.AdminUpdateRequest
import com.example.demo.servicio.AdminService
import com.example.demo.servicio.UsuarioService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import org.springframework.security.core.userdetails.User
import org.springframework.security.access.prepost.PreAuthorize
import com.example.demo.modelo.Usuario

data class AdminConUsuarioDTO(
    val idAdmin: Int?,
    val idUsuario: Int?,
    val cedulaAdmin: Int,
    val nombreAdmin: String,
    val apellidoAdmin: String,
    val telefonoAdmin: String,
    val email: String
)

@RestController
@RequestMapping("/api/admins")
class AdminController(
    private val adminService: AdminService,
    private val usuarioService: UsuarioService
) {

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    fun obtenerTodosLosAdmins(): ResponseEntity<List<AdminConUsuarioDTO>> {
        val adminsConUsuario = adminService.obtenerTodosLosAdminsConUsuario()
        return ResponseEntity.ok(adminsConUsuario)
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    fun obtenerAdminPorId(@PathVariable id: Int): ResponseEntity<*> {
        val adminConUsuario = adminService.obtenerAdminPorIdConUsuario(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Admin no encontrado."))
        return ResponseEntity.ok(adminConUsuario)
    }

    @PatchMapping("/perfil")
    fun actualizarPerfilAdmin(@RequestBody request: AdminUpdateRequest): ResponseEntity<*> {
        val userDetails = SecurityContextHolder.getContext().authentication.principal as User
        val usuario = usuarioService.obtenerUsuarioPorEmail(userDetails.username)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Usuario no encontrado."))

        val fueActualizado = adminService.actualizarPerfil(usuario.idUsuario!!, request)
        return if (fueActualizado) {
            val adminActualizado = adminService.obtenerAdminPorIdConUsuario(usuario.idUsuario)
            ResponseEntity.ok(
                mapOf(
                    "mensaje" to "Perfil de admin actualizado correctamente.",
                    "data" to adminActualizado
                )
            )
        } else {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("error" to "No se pudo actualizar el perfil. Verifique los datos."))
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    fun actualizarAdminPorId(@PathVariable id: Int, @RequestBody request: AdminUpdateRequest): ResponseEntity<*> {
        val fueActualizado = adminService.actualizarAdminPorId(id, request)
        return if (fueActualizado) {
            val adminActualizado = adminService.obtenerAdminPorIdConUsuario(id)
            ResponseEntity.ok(mapOf("mensaje" to "Admin actualizado correctamente.", "data" to adminActualizado))
        } else {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("error" to "No se pudo actualizar el admin. Verifique los datos."))
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    fun eliminarAdmin(@PathVariable id: Int): ResponseEntity<*> {
        val fueEliminado = adminService.eliminarAdmin(id)
        return if (fueEliminado) {
            ResponseEntity.ok(mapOf("mensaje" to "Admin y su usuario fueron eliminados correctamente."))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Admin no encontrado."))
        }
    }
}