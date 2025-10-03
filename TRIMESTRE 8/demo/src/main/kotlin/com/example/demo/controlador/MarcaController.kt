package com.example.demo.controlador

import com.example.demo.modelo.Marca
import com.example.demo.servicio.MarcaService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/marcas")
class MarcaController {
    @Autowired
    private lateinit var marcaService: MarcaService

    // ✅ GET todas
    @GetMapping
    fun obtenerMarcas(): List<Marca> {
        return marcaService.obtenerTodasLasMarcas()
    }

    // ✅ GET por id
    @GetMapping("/{id}")
    fun obtenerMarcaPorId(@PathVariable id: Int): ResponseEntity<Marca> {
        val marca = marcaService.obtenerMarcaPorId(id)
        return if (marca != null) {
            ResponseEntity.ok(marca)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }
    }

    // ✅ POST
    @PostMapping
    fun crearMarca(@RequestBody nuevaMarca: Marca): ResponseEntity<Marca> {
        val marcaCreada = marcaService.crearMarca(nuevaMarca)
        return ResponseEntity(marcaCreada, HttpStatus.CREATED)
    }

    // ✅ PUT
    @PutMapping("/{id}")
    fun actualizarMarca(@PathVariable id: Int, @RequestBody marcaActualizada: Marca): ResponseEntity<*> {
        val marcaConId = marcaActualizada.copy(idMarca = id)
        val fueActualizada = marcaService.actualizarMarca(marcaConId)

        return if (fueActualizada) {
            ResponseEntity.ok(mapOf("mensaje" to "Marca actualizada correctamente"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Marca no encontrada"))
        }
    }

    // ✅ PATCH
    @PatchMapping("/{id}")
    fun actualizarParcialmenteMarca(@PathVariable id: Int, @RequestBody campos: Map<String, Any>): ResponseEntity<*> {
        val fueActualizada = marcaService.actualizarParcialmenteMarca(id, campos)

        return if (fueActualizada) {
            ResponseEntity.ok(mapOf("mensaje" to "Marca actualizada parcialmente"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Marca no encontrada o no se enviaron campos válidos"))
        }
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    fun eliminarMarca(@PathVariable id: Int): ResponseEntity<*> {
        val fueEliminada = marcaService.eliminarMarca(id)

        return if (fueEliminada) {
            ResponseEntity.ok(mapOf("mensaje" to "Marca eliminada exitosamente."))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Marca no encontrada."))
        }
    }
}
