// src/pages/admin/CategoriasAdmin.js

import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import categoriaService from "../../services/categoriaService"; // Importa tu servicio de categorías

export default function CategoriasAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "editar" o "agregar"
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Para errores globales
  const [modalError, setModalError] = useState(null); // Para errores dentro del modal
  const [modalSuccess, setModalSuccess] = useState(null); // Para mensajes de éxito dentro del modal
  const [isSaving, setIsSaving] = useState(false); // Estado para indicar si se está guardando
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // Nuevo estado para el modal de confirmación
  const [categoryToDelete, setCategoryToDelete] = useState(null); // ID de la categoría a eliminar

  // Efecto para cargar las categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      setError(null); // Limpiar errores previos al inicio de la carga
      try {
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
    setModalError(null); // Limpiar errores del modal al abrirlo
    setModalSuccess(null); // Limpiar mensajes de éxito del modal
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setNombreCategoria("");
    setModalError(null);
    setModalSuccess(null);
  };

  // ✅ Función para mostrar el modal de confirmación de eliminación
  const confirmDelete = (id) => {
    setCategoryToDelete(id);
    setShowConfirmDeleteModal(true);
  };

  // ✅ Función para ejecutar la eliminación después de la confirmación
  const handleDeleteConfirmed = async () => {
    setShowConfirmDeleteModal(false); // Cerrar el modal de confirmación
    if (!categoryToDelete) return;

    setLoading(true); // Mostrar carga global
    setError(null); // Limpiar errores previos
    try {
      await categoriaService.deleteCategoria(categoryToDelete);
      setCategorias((prevCategorias) => prevCategorias.filter((cat) => cat.idCategoria !== categoryToDelete));
      // Puedes añadir un mensaje de éxito global aquí si lo deseas
    } catch (err) {
      console.error("Error al eliminar la categoría:", err);
      setError(err.message || 'Error al eliminar la categoría.');
    } finally {
      setLoading(false); // Ocultar carga
      setCategoryToDelete(null); // Limpiar el ID de la categoría a eliminar
    }
  };

  const handleSaveCategory = async () => {
    setModalError(null); // Limpiar errores del modal
    setModalSuccess(null); // Limpiar mensajes de éxito del modal

    if (!nombreCategoria.trim()) {
      setModalError("El nombre de la categoría no puede estar vacío.");
      return;
    }

    setIsSaving(true); // Activar estado de guardado

    try {
      let responseData; // Para almacenar la categoría creada/actualizada
      const categoriaData = { nombreCategoria: nombreCategoria.trim() };

      if (modalType === "agregar") {
        responseData = await categoriaService.createCategoria(categoriaData);
        setCategorias((prevCategorias) => [...prevCategorias, responseData]);
        setModalSuccess("Categoría agregada correctamente.");
      } else { // modalType === "editar"
        if (!selectedCategory || !selectedCategory.idCategoria) {
            setModalError("ID de categoría no válido para editar.");
            setIsSaving(false);
            return;
        }
        responseData = await categoriaService.updateCategoria(selectedCategory.idCategoria, categoriaData);
        setCategorias((prevCategorias) =>
          prevCategorias.map((cat) =>
            cat.idCategoria === responseData.idCategoria ? responseData : cat
          )
        );
        setModalSuccess("Categoría actualizada correctamente.");
      }
      // Opcional: Cerrar el modal automáticamente después de un éxito al agregar/editar
      // setTimeout(() => handleCloseModal(), 1500); 
    } catch (err) {
      console.error("Error al guardar la categoría:", err);
      setModalError(err.message || 'Error al guardar la categoría. Por favor, intente de nuevo.');
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando categorías...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando lista de categorías...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-folder-fill me-3"></i>Administrar Categorías
      </h1>

      {/* Mensaje de error global (si no hay modal abierto) */}
      {error && !showModal && (
        <div className="alert alert-danger text-center animated fadeIn mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      <div className="d-flex justify-content-end mb-3"> {/* Botón a la derecha */}
        <button 
          className="btn btn-success rounded-pill fw-semibold shadow-sm" 
          onClick={() => handleShowModal("agregar")}
        >
          <i className="bi bi-plus-circle-fill me-2"></i> Agregar Categoría
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded-lg">
        <table className="table table-hover table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col" className="text-center" style={{ minWidth: '180px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(categorias) && categorias.length > 0 ? (
              categorias.map((categoria) => (
                <tr key={categoria.idCategoria}> 
                  <td className="fw-bold">{categoria.idCategoria}</td> 
                  <td>{categoria.nombreCategoria}</td> 
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2 rounded-pill fw-semibold"
                      onClick={() => handleShowModal("editar", categoria)}
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-pill fw-semibold"
                      onClick={() => confirmDelete(categoria.idCategoria)} // ✅ Usa el nuevo modal de confirmación
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted fs-5">
                  No se encontraron categorías.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar categoría */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-md" role="document"> {/* Tamaño mediano */}
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${modalType === "agregar" ? "bi-plus-circle-fill" : "bi-pencil-fill"} me-2`}></i>
                  {modalType === "agregar" ? "Agregar Nueva Categoría" : "Editar Categoría"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                {modalError && (
                  <div className="alert alert-danger text-center animated fadeIn mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {modalError}
                  </div>
                )}
                {modalSuccess && (
                  <div className="alert alert-success text-center animated fadeIn mb-3" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i> {modalSuccess}
                  </div>
                )}
                <form onSubmit={(e) => e.preventDefault()}> 
                  <div className="mb-3">
                    <label htmlFor="nombreCategoria" className="form-label fw-semibold"> {/* Cambiado a nombreCategoria */}
                      <i className="bi bi-tag-fill me-2"></i>Nombre de la Categoría
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill" // Añadido form-control-lg rounded-pill
                      id="nombreCategoria" // Cambiado a nombreCategoria
                      value={nombreCategoria} 
                      onChange={(e) => setNombreCategoria(e.target.value)}
                      required 
                      disabled={isSaving} 
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer rounded-bottom-3">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill fw-semibold me-2" // Añadido rounded-pill fw-semibold
                  onClick={handleCloseModal}
                  disabled={isSaving} 
                >
                  <i className="bi bi-x-circle-fill me-2"></i> Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill fw-semibold" // Añadido rounded-pill fw-semibold
                  onClick={handleSaveCategory}
                  disabled={isSaving} 
                >
                  <i className="bi bi-save-fill me-2"></i> {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal de Confirmación de Eliminación */}
      {showConfirmDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-danger text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Confirmar Eliminación
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmDeleteModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="fs-5 mb-4">¿Estás seguro de que deseas eliminar esta categoría?</p>
                <p className="text-muted small">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer rounded-bottom-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill fw-semibold me-3"
                  onClick={() => setShowConfirmDeleteModal(false)}
                >
                  <i className="bi bi-x-circle-fill me-2"></i> Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger rounded-pill fw-semibold" 
                  onClick={handleDeleteConfirmed}
                >
                  <i className="bi bi-trash-fill me-2"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
