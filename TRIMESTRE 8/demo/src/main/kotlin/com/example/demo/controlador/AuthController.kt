package com.example.demo.controlador

import com.example.demo.request.LoginRequest
import com.example.demo.request.RegistroAdminRequest
import com.example.demo.request.RegistroClienteRequest
import com.example.demo.servicio.AuthService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/register/cliente")
    fun registerCliente(@RequestBody request: RegistroClienteRequest): ResponseEntity<*> {
        return try {
            val cliente = authService.registerCliente(request)
            ResponseEntity.status(HttpStatus.CREATED).body(cliente)
        } catch (e: RuntimeException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        }
    }

    @PostMapping("/register/admin")
    fun registerAdmin(@RequestBody request: RegistroAdminRequest): ResponseEntity<*> {
        return try {
            val admin = authService.registerAdmin(request)
            ResponseEntity.status(HttpStatus.CREATED).body(admin)
        } catch (e: RuntimeException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        }
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<*> {
        val usuario = authService.login(request)
        return if (usuario != null) {
            ResponseEntity.ok(mapOf("message" to "Usuario autenticado correctamente.", "usuario" to usuario))
        } else {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to "Credenciales incorrectas."))
        }
    }
}