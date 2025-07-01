// src/pages/admin/MarcasAdmin.js

import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import marcaService from "../../services/marcaService"; // Import the brand service

export default function MarcasAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "editar" o "agregar"
  const [selectedMarca, setSelectedMarca] = useState(null);
  const [marcas, setMarcas] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Para errores globales
  const [modalError, setModalError] = useState(null); // Para errores dentro del modal
  const [modalSuccess, setModalSuccess] = useState(null); // Para mensajes de éxito dentro del modal
  const [nombreMarca, setNombreMarca] = useState(''); 
  const [isSaving, setIsSaving] = useState(false); // Estado para indicar si se está guardando
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // Nuevo estado para el modal de confirmación
  const [marcaToDelete, setMarcaToDelete] = useState(null); // ID de la marca a eliminar

  // Fetch brands on component mount
  useEffect(() => {
    const fetchMarcas = async () => {
      setLoading(true);
      setError(null); 
      try {
        const fetchedMarcas = await marcaService.getAllMarcas();
        
        if (Array.isArray(fetchedMarcas)) {
          setMarcas(fetchedMarcas);
          setError(null); 
        } else {
          console.error("La API no devolvió una lista de marcas válida. Datos recibidos:", fetchedMarcas);
          setError("La API no devolvió una lista de marcas válida.");
          setMarcas([]); 
        }
      } catch (err) {
        console.error("Error al cargar las marcas:", err);
        setError("Error al cargar las marcas: " + (err.message || "Error desconocido."));
        setMarcas([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchMarcas();
  }, []);

  const handleShowModal = (type, marca = null) => {
    setModalType(type);
    setSelectedMarca(marca);
    setNombreMarca(marca ? marca.nombreMarca : ''); 
    setModalError(null); // Limpiar errores del modal
    setModalSuccess(null); // Limpiar mensajes de éxito del modal
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMarca(null);
    setNombreMarca(''); 
    setModalError(null); 
    setModalSuccess(null);
  };

  // ✅ Función para mostrar el modal de confirmación de eliminación
  const confirmDelete = (id) => {
    setMarcaToDelete(id);
    setShowConfirmDeleteModal(true);
  };

  // ✅ Función para ejecutar la eliminación después de la confirmación
  const handleDeleteConfirmed = async () => {
    setShowConfirmDeleteModal(false); // Cerrar el modal de confirmación
    if (!marcaToDelete) return;

    setLoading(true); // Mostrar carga global
    setError(null); // Limpiar errores globales
    try {
      await marcaService.deleteMarca(marcaToDelete);
      setMarcas(marcas.filter((marca) => marca.idMarca !== marcaToDelete)); 
      // Puedes añadir un mensaje de éxito global aquí si lo deseas
    } catch (err) {
      console.error("Error al eliminar la marca:", err);
      setError(err.message || 'Error al eliminar la marca.');
    } finally {
      setLoading(false); 
      setMarcaToDelete(null); 
    }
  };

  const handleSaveMarca = async () => {
    setModalError(null); // Limpiar errores del modal
    setModalSuccess(null); // Limpiar mensajes de éxito del modal

    if (!nombreMarca.trim()) {
      setModalError("El nombre de la marca no puede estar vacío.");
      return;
    }

    setIsSaving(true); // Activar estado de guardado

    try {
      let responseData;
      const marcaData = { nombreMarca: nombreMarca.trim() }; 

      if (modalType === "agregar") {
        responseData = await marcaService.createMarca(marcaData);
        setMarcas((prevMarcas) => [...prevMarcas, responseData]); 
        setModalSuccess("Marca agregada correctamente.");
      } else { // modalType === "editar"
        if (!selectedMarca || !selectedMarca.idMarca) { 
          setModalError("ID de marca no válido para editar.");
          setIsSaving(false);
          return;
        }
        responseData = await marcaService.updateMarca(selectedMarca.idMarca, marcaData);
        setMarcas((prevMarcas) =>
          prevMarcas.map((marca) =>
            marca.idMarca === responseData.idMarca ? responseData : marca 
          )
        );
        setModalSuccess("Marca actualizada correctamente.");
      }
      // Opcional: Cerrar el modal automáticamente después de un éxito al agregar/editar
      // setTimeout(() => handleCloseModal(), 1500); 
    } catch (err) {
      console.error("Error al guardar la marca:", err);
      setModalError(err.message || 'Error al guardar la marca. Por favor, intente de nuevo.');
    } finally {
      setIsSaving(false); 
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando marcas...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando lista de marcas...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-tags-fill me-3"></i>Administrar Marcas
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
          <i className="bi bi-plus-circle-fill me-2"></i> Agregar Marca
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
            {Array.isArray(marcas) && marcas.length > 0 ? (
              marcas.map((marca) => (
                <tr key={marca.idMarca}> 
                  <td className="fw-bold">{marca.idMarca}</td> 
                  <td>{marca.nombreMarca}</td> 
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2 rounded-pill fw-semibold"
                      onClick={() => handleShowModal("editar", marca)}
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-pill fw-semibold"
                      onClick={() => confirmDelete(marca.idMarca)} // ✅ Usa el nuevo modal de confirmación
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted fs-5">
                  No se encontraron marcas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar marca */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-md" role="document"> {/* Tamaño mediano */}
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${modalType === "agregar" ? "bi-plus-circle-fill" : "bi-pencil-fill"} me-2`}></i>
                  {modalType === "agregar" ? "Agregar Nueva Marca" : "Editar Marca"}
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
                    <label htmlFor="nombreMarca" className="form-label fw-semibold">
                      <i className="bi bi-tag-fill me-2"></i>Nombre de la Marca
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      id="nombreMarca"
                      value={nombreMarca} 
                      onChange={(e) => setNombreMarca(e.target.value)}
                      required 
                      disabled={isSaving} 
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer rounded-bottom-3">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill fw-semibold me-2"
                  onClick={handleCloseModal}
                  disabled={isSaving} 
                >
                  <i className="bi bi-x-circle-fill me-2"></i> Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill fw-semibold"
                  onClick={handleSaveMarca}
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
                <p className="fs-5 mb-4">¿Estás seguro de que deseas eliminar esta marca?</p>
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
