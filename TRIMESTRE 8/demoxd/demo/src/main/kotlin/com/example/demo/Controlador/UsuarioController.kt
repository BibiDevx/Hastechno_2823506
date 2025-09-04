package com.example.demo.Controlador

import com.example.demo.Modelo.Usuario
import com.example.demo.Servicio.UsuarioService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.http.HttpStatus

@RestController
@RequestMapping("api/usuarios")
class UsuarioController{

 @Autowired
    private lateinit var usuarioService: UsuarioService

    @PostMapping
    fun crearUsuario(@RequestBody usuario: Usuario): ResponseEntity<Usuario> {
        val nuevoUsuario = usuarioService.crearUsuario(usuario)
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario)
    }

    @GetMapping
    fun listarUsuarios(): ResponseEntity<List<Usuario>> {
        val usuarios = usuarioService.listarTodos()
        return ResponseEntity.ok(usuarios)
    }

    @GetMapping("/{id}")
    fun buscarUsuarioPorId(@PathVariable id: Int): ResponseEntity<Usuario> {
        val usuario = usuarioService.buscarPorId(id)
        return if (usuario != null) {
            ResponseEntity.ok(usuario)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PutMapping("/{id}")
    fun actualizarUsuario(@PathVariable id: Int, @RequestBody usuario: Usuario): ResponseEntity<Void> {
        usuarioService.actualizarUsuario(usuario.copy(idUsuario = id))
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{id}")
    fun eliminarUsuario(@PathVariable id: Int): ResponseEntity<Void> {
        usuarioService.eliminarUsuario(id)
        return ResponseEntity.noContent().build()
    }
    
}
