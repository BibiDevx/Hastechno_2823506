package com.example.demo.controlador

import com.example.demo.modelo.Usuario
import com.example.demo.servicio.UsuarioService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/usuarios")
class UsuarioController(private val usuarioService: UsuarioService) {

    @PostMapping("/crear")
    fun crearUsuario(@RequestBody request: Map<String, String>): ResponseEntity<*> {
        val nombreRol = request["nombreRol"]
        val email = request["email"]
        val password = request["password"]

        if (nombreRol == null || email == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to "Faltan parámetros."))
        }

        return try {
            val usuario = usuarioService.crearOencontrarUsuario(nombreRol, email, password)
            ResponseEntity.status(HttpStatus.CREATED).body(usuario)
        } catch (e: RuntimeException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        }
    }

    @GetMapping
    fun obtenerTodosLosUsuarios(): ResponseEntity<List<Usuario>> {
        val usuarios = usuarioService.obtenerTodosLosUsuarios()
        return ResponseEntity.ok(usuarios)
    }

    @GetMapping("/{id}")
    fun obtenerUsuarioPorId(@PathVariable id: Int): ResponseEntity<*> {
        val usuario = usuarioService.obtenerUsuarioPorId(id)
        return if (usuario != null) {
            ResponseEntity.ok(usuario)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "usuario no encontrado."))
        }
    }

    @DeleteMapping("/{id}")
    fun eliminarUsuario(@PathVariable id: Int): ResponseEntity<*> {
        val fueEliminado = usuarioService.eliminarUsuario(id)
        return if (fueEliminado) {
            ResponseEntity.ok(mapOf("mensaje" to "usuario eliminado exitosamente."))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "usuario no encontrado."))
        }
    }
}