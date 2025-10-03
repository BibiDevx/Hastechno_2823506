package com.example.demo.controlador

import com.example.demo.modelo.Producto
import com.example.demo.modelo.Categoria
import com.example.demo.servicio.ProductoService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.http.HttpStatus

@RestController
@RequestMapping("/api/productos")
class ProductoController {
    @Autowired
    private lateinit var productoService: ProductoService

    @GetMapping
    fun obtenerProductos(): List<Producto> {
        return productoService.obtenerTodosLosProductos()
    }
    @GetMapping("/{id}")
    fun obtenerProductoPorId(@PathVariable id: Int): ResponseEntity<Producto> {
        val producto = productoService.obtenerProductoPorId(id)
        return if (producto != null) {
            ResponseEntity.ok(producto)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }
    }
    @PostMapping
    fun crearProducto(@RequestBody nuevoProducto: Producto): ResponseEntity<Producto> {
        val productoCreado = productoService.crearProducto(nuevoProducto)
        return ResponseEntity(productoCreado, HttpStatus.CREATED)
    }
    @PutMapping("/{id}")
    fun actualizarProducto(@PathVariable id: Int, @RequestBody productoActualizado: Producto): ResponseEntity<*> {
        val productoConId = productoActualizado.copy(idProducto = id)

        val fueActualizado = productoService.actualizarProducto(productoConId)

        return if (fueActualizado) {
            ResponseEntity.ok(mapOf("mensaje" to "Producto actualizado correctamente"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Producto no encontrado"))
        }
    }
    @PatchMapping("/{id}")
    fun actualizarParcialmenteProducto(@PathVariable id: Int, @RequestBody campos: Map<String, Any>): ResponseEntity<*> {
        val fueActualizado = productoService.actualizarParcialmenteProducto(id, campos)

        return if (fueActualizado) {
            ResponseEntity.ok(mapOf("mensaje" to "Producto actualizado parcialmente"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Producto no encontrado o no se enviaron campos válidos para actualizar"))
        }
    }
    @DeleteMapping("/{id}")
    fun eliminarProducto(@PathVariable id: Int): ResponseEntity<*> {
        val fueEliminado = productoService.eliminarProducto(id)

        return if (fueEliminado) {
            ResponseEntity.ok(mapOf("mensaje" to "Producto eliminado exitosamente."))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Producto no encontrado."))
        }
    }
    @GetMapping("/{id}/categorias")
    fun obtenerCategoriasPorProducto(@PathVariable id: Int): ResponseEntity<List<Categoria>> {
        val categorias = productoService.obtenerCategoriasPorProducto(id)
        return ResponseEntity.ok(categorias)
    }

    @PatchMapping("/{id}/categorias")
    fun syncCategorias(
        @PathVariable id: Int,
        @RequestBody body: Map<String, List<Int>>
    ): ResponseEntity<*> {
        val categorias = body["categorias"] ?: return ResponseEntity.badRequest()
            .body(mapOf("error" to "Debe enviar un array 'categorias'"))

        productoService.sincronizarCategorias(id, categorias)
        return ResponseEntity.ok(mapOf("mensaje" to "Categorías sincronizadas correctamente"))
    }

}