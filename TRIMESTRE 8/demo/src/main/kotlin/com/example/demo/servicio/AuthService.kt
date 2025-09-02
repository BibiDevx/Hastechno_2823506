package com.example.demo.servicio

import com.example.demo.modelo.Admin
import com.example.demo.modelo.Cliente
import com.example.demo.modelo.Usuario
import com.example.demo.request.LoginRequest
import com.example.demo.request.RegistroAdminRequest
import com.example.demo.request.RegistroClienteRequest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val usuarioService: UsuarioService,
    private val clienteService: ClienteService,
    private val adminService: AdminService,
    private val passwordEncoder: PasswordEncoder
) {

    fun registerCliente(request: RegistroClienteRequest): Cliente {
        val usuarioCreado = usuarioService.crearOencontrarUsuario(
            "Cliente",
            request.email,
            request.password
        )

        val nuevoCliente = Cliente(
            idUsuario = usuarioCreado.idUsuario,
            cedulaCliente = request.cedulaCliente,
            nombreCliente = request.nombreCliente,
            apellidoCliente = request.apellidoCliente,
            telefonoCliente = request.telefonoCliente,
            direccion = request.direccion
        )

        return clienteService.crearCliente(nuevoCliente)
    }

    fun registerAdmin(request: RegistroAdminRequest): Admin {
        val usuarioCreado = usuarioService.crearOencontrarUsuario(
            "Admin",
            request.email,
            request.password
        )

        val nuevoAdmin = Admin(
            idUsuario = usuarioCreado.idUsuario,
            cedulaAdmin = request.cedulaAdmin,
            nombreAdmin = request.nombreAdmin,
            apellidoAdmin = request.apellidoAdmin,
            telefonoAdmin = request.telefonoAdmin
        )

        return adminService.crearAdmin(nuevoAdmin)
    }

    fun login(request: LoginRequest): Usuario? {
        val usuario = usuarioService.obtenerUsuarioPorEmail(request.email)
        if (usuario != null && passwordEncoder.matches(request.password, usuario.password)) {
            return usuario
        }
        return null
    }
}