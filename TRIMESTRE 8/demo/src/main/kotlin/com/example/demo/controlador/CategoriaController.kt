package com.example.demo.controlador

import com.example.demo.modelo.Categoria
import com.example.demo.servicio.CategoriaService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categorias")
class CategoriaController {
    @Autowired
    private lateinit var categoriaService: CategoriaService

    // ✅ GET todas
    @GetMapping
    fun obtenerCategorias(): List<Categoria> {
        return categoriaService.obtenerTodasLasCategorias()
    }

    // ✅ GET por id
    @GetMapping("/{id}")
    fun obtenerCategoriaPorId(@PathVariable id: Int): ResponseEntity<Categoria> {
        val categoria = categoriaService.obtenerCategoriaPorId(id)
        return if (categoria != null) {
            ResponseEntity.ok(categoria)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }
    }

    // ✅ POST
    @PostMapping
    fun crearCategoria(@RequestBody nuevaCategoria: Categoria): ResponseEntity<Categoria> {
        val categoriaCreada = categoriaService.crearCategoria(nuevaCategoria)
        return ResponseEntity(categoriaCreada, HttpStatus.CREATED)
    }

    // ✅ PUT
    @PutMapping("/{id}")
    fun actualizarCategoria(@PathVariable id: Int, @RequestBody categoriaActualizada: Categoria): ResponseEntity<*> {
        val categoriaConId = categoriaActualizada.copy(idCategoria = id)
        val fueActualizada = categoriaService.actualizarCategoria(categoriaConId)

        return if (fueActualizada) {
            ResponseEntity.ok(mapOf("mensaje" to "Categoría actualizada correctamente"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Categoría no encontrada"))
        }
    }

    // ✅ PATCH
    @PatchMapping("/{id}")
    fun actualizarParcialmenteCategoria(@PathVariable id: Int, @RequestBody campos: Map<String, Any>): ResponseEntity<*> {
        val fueActualizada = categoriaService.actualizarParcialmenteCategoria(id, campos)

        return if (fueActualizada) {
            ResponseEntity.ok(mapOf("mensaje" to "Categoría actualizada parcialmente"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Categoría no encontrada o no se enviaron campos válidos"))
        }
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    fun eliminarCategoria(@PathVariable id: Int): ResponseEntity<*> {
        val fueEliminada = categoriaService.eliminarCategoria(id)

        return if (fueEliminada) {
            ResponseEntity.ok(mapOf("mensaje" to "Categoría eliminada exitosamente."))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Categoría no encontrada."))
        }
    }
}
