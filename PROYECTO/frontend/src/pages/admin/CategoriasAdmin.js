import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import categoriaService from "../../services/categoriaService"; // Importa tu servicio de categorías

export default function CategoriasAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para el guardado

  // Efecto para cargar las categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      setError(null); // Limpiar errores previos al inicio de la carga
      try {
        // ✅ CORRECCIÓN CLAVE: categoriaService.getAllCategorias() ahora devuelve directamente el array
        const fetchedCategorias = await categoriaService.getAllCategorias(); 
        
        if (Array.isArray(fetchedCategorias)) {
          setCategorias(fetchedCategorias);
          setError(null);
        } else {
          console.error("La API no devolvió una lista de categorías válida. Datos recibidos:", fetchedCategorias);
          setError("La API no devolvió una lista de categorías válida.");
          setCategorias([]);
        }
      } catch (err) {
        console.error("Error al cargar las categorías:", err);
        // El mensaje de error ya debe venir formateado desde el servicio
        setError("Error al cargar las categorías: " + (err.message || "Error desconocido."));
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleShowModal = (type, category = null) => {
    setModalType(type);
    setSelectedCategory(category);
    setNombreCategoria(category ? category.nombreCategoria : "");
    setShowModal(true);
    setError(null); // Limpiar errores del modal al abrirlo
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setNombreCategoria("");
    setError(null);
  };

  const handleSaveCategory = async () => {
    if (!nombreCategoria.trim()) {
      setError("El nombre de la categoría no puede estar vacío.");
      return;
    }

    setIsSaving(true); // Activar estado de guardado
    setError(null); // Limpiar errores antes de guardar

    try {
      let responseData; // Para almacenar la categoría creada/actualizada
      const categoriaData = { nombreCategoria: nombreCategoria.trim() };

      if (modalType === "agregar") {
        // ✅ CORRECCIÓN: createCategoria() devuelve directamente el objeto de la nueva categoría
        responseData = await categoriaService.createCategoria(categoriaData);
        setCategorias((prevCategorias) => [...prevCategorias, responseData]);
      } else { // modalType === "editar"
        if (!selectedCategory || !selectedCategory.idCategoria) {
            setError("ID de categoría no válido para editar.");
            setIsSaving(false);
            return;
        }
        // ✅ CORRECCIÓN: updateCategoria() devuelve directamente el objeto de la categoría actualizada
        responseData = await categoriaService.updateCategoria(selectedCategory.idCategoria, categoriaData);
        setCategorias((prevCategorias) =>
          prevCategorias.map((cat) =>
            cat.idCategoria === responseData.idCategoria ? responseData : cat
          )
        );
      }
      handleCloseModal();
      alert(`Categoría ${modalType === 'agregar' ? 'agregada' : 'actualizada'} correctamente.`);
    } catch (err) {
      console.error("Error al guardar la categoría:", err);
      setError(err.message || 'Error al guardar la categoría. Por favor, intente de nuevo.');
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      setLoading(true); // Mostrar carga mientras se elimina
      setError(null); // Limpiar errores previos
      try {
        // ✅ categoriaService.deleteCategoria() devuelve un objeto con { success: true, message: '...' }
        // No necesitamos la respuesta de este servicio para actualizar el estado,
        // solo esperamos que no lance un error.
        await categoriaService.deleteCategoria(id);
        setCategorias((prevCategorias) => prevCategorias.filter((cat) => cat.idCategoria !== id));
        alert("Categoría eliminada correctamente.");
      } catch (err) {
        console.error("Error al eliminar la categoría:", err);
        setError(err.message || 'Error al eliminar la categoría.');
      } finally {
        setLoading(false); // Ocultar carga
      }
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando categorías...</span>
        </div>
        <p className="mt-2 text-muted">Cargando lista de categorías...</p>
      </div>
    );
  }

  // Muestra el error general si la carga ha terminado y hay un error, y el modal no está abierto
  if (error && !showModal) { 
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Categorías</h2>

      <button className="btn btn-success mb-3" onClick={() => handleShowModal("agregar")}>
        <i className="bi bi-plus-circle-fill me-2"></i> Agregar Categoría
      </button>

      <table className="table table-bordered table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(categorias) && categorias.length > 0 ? (
            categorias.map((categoria) => (
              <tr key={categoria.idCategoria}> 
                <td>{categoria.idCategoria}</td> 
                <td>{categoria.nombreCategoria}</td> 
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleShowModal("editar", categoria)}
                  >
                    <i className="bi bi-pencil-fill me-1"></i> Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(categoria.idCategoria)}
                  >
                    <i className="bi bi-trash-fill me-1"></i> Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                No se encontraron categorías.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal para agregar/editar categoría */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {modalType === "agregar" ? "Agregar Categoría" : "Editar Categoría"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => e.preventDefault()}> 
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre de la Categoría</label>
                        <input
                            type="text"
                            id="nombre"
                            className="form-control"
                            value={nombreCategoria}
                            onChange={(e) => setNombreCategoria(e.target.value)}
                            required
                            disabled={isSaving} // Deshabilitar durante el guardado
                        />
                    </div>
                </form>
                {/* Muestra el error dentro del modal si es relevante */}
                {error && <div className="alert alert-danger mt-3">{error}</div>} 
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={isSaving} // Deshabilitar durante el guardado
                >
                  <i className="bi bi-x-circle-fill me-2"></i> Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveCategory}
                  disabled={isSaving} // Deshabilitar mientras se guarda
                >
                  <i className="bi bi-save-fill me-2"></i> {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
