// src/components/ProveedoresAdmin.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";  
import proveedorService from "../../services/proveedorService"; 

export default function ProveedoresAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "editar" o "agregar"

  // Estado para los datos del formulario de proveedor
  const [formData, setFormData] = useState({
    idProveedor: null,
    nombreProveedor: "",
    emailProveedor: "", 
    telefonoProveedor: "",
  });

  // Estado para la lista de proveedores
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para la carga inicial de la tabla
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para indicar si se está guardando
  const [error, setError] = useState(null); // Para errores globales
  const [modalError, setModalError] = useState(null); // Para errores dentro del modal
  const [modalSuccess, setModalSuccess] = useState(null); // Para mensajes de éxito dentro del modal

  // Estados para el modal de confirmación de eliminación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [proveedorToDeleteId, setProveedorToDeleteId] = useState(null);

  // Función para cargar los proveedores desde el backend
  const fetchProveedores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proveedorService.getAllProveedores(); 
      setProveedores(data);
    } catch (err) {
      console.error("Error al cargar los proveedores:", err);
      setError(
        "Error al cargar los proveedores: " + (err.message || "Error desconocido.")
      );
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los proveedores al montar el componente
  useEffect(() => {
    fetchProveedores();
  }, []);

  // Manejador para mostrar el modal (agregar o editar)
  const handleShowModal = (type, proveedor = null) => {
    setModalType(type);
    setModalError(null); // Limpiar errores del modal
    setModalSuccess(null); // Limpiar mensajes de éxito del modal
    if (proveedor) {
      setFormData({
        idProveedor: proveedor.idProveedor,
        nombreProveedor: proveedor.nombreProveedor,
        emailProveedor: proveedor.emailProveedor, 
        telefonoProveedor: proveedor.telefonoProveedor,
      });
    } else {
      setFormData({
        idProveedor: null,
        nombreProveedor: "",
        emailProveedor: "", 
        telefonoProveedor: "",
      });
    }
    setShowModal(true);
  };

  // Manejador para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Reinicia el formulario y errores
    setFormData({
      idProveedor: null,
      nombreProveedor: "",
      emailProveedor: "", 
      telefonoProveedor: "",
    });
    setModalError(null);
    setModalSuccess(null);
  };

  // Manejador para cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador para guardar un proveedor (crear o actualizar)
  const handleSaveProveedor = async () => {
    setModalError(null); // Limpiar errores antes de guardar
    setModalSuccess(null); // Limpiar mensajes de éxito antes de guardar

    // Validaciones de frontend
    if (
      !formData.nombreProveedor.trim() ||
      !formData.emailProveedor.trim() || 
      !formData.telefonoProveedor.trim()
    ) {
      setModalError("Todos los campos obligatorios deben ser completados.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailProveedor)) { 
      setModalError("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    setIsSaving(true); // Activar estado de guardado

    try {
      let response;
      const dataToSend = { ...formData }; // Los datos ya están correctamente mapeados

      if (modalType === "agregar") {
        response = await proveedorService.createProveedor(dataToSend);
        setProveedores((prevProveedores) => [...prevProveedores, response]); 
        setModalSuccess("Proveedor agregado correctamente.");
      } else {
        if (!formData.idProveedor) {
          setModalError("ID de proveedor no válido para editar.");
          setIsSaving(false); // Desactivar si hay un error
          return;
        }
        response = await proveedorService.updateProveedor(formData.idProveedor, dataToSend);
        setProveedores((prevProveedores) =>
          prevProveedores.map((proveedor) =>
            proveedor.idProveedor === response.idProveedor ? response : proveedor
          )
        );
        setModalSuccess("Proveedor actualizado correctamente.");
      }

      // Opcional: Cerrar el modal al guardar con éxito después de un breve retraso
      // setTimeout(() => handleCloseModal(), 1500); 
    } catch (err) {
      console.error("Error al guardar el proveedor:", err);
      // El getErrorMessage en el servicio ya maneja la prioridad de mensajes
      setModalError(err.message || "Error desconocido al guardar el proveedor.");
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
    }
  };

  // ✅ Manejador para mostrar el modal de confirmación de eliminación
  const confirmDelete = (id) => {
    setProveedorToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  // ✅ Manejador para la eliminación confirmada
  const handleDeleteConfirmed = async () => {
    setShowDeleteConfirmModal(false); // Cerrar modal de confirmación
    if (!proveedorToDeleteId) return;

    setLoading(true); // Mostrar carga mientras se elimina
    setError(null); // Limpiar errores previos (globales)
    try {
      const response = await proveedorService.deleteProveedor(proveedorToDeleteId); 
      if (response.success) {
          setProveedores((prevProveedores) => prevProveedores.filter((proveedor) => proveedor.idProveedor !== proveedorToDeleteId));
          // Puedes añadir un mensaje de éxito global aquí si lo deseas
      } else {
          throw new Error(response.message || "Fallo al eliminar el proveedor.");
      }
    } catch (err) {
      console.error("Error al eliminar el proveedor:", err);
      setError(err.message || "Error al eliminar el proveedor.");
    } finally {
      setLoading(false);
      setProveedorToDeleteId(null); // Limpiar ID del proveedor a eliminar
    }
  };

  // Renderizado condicional para el estado de carga inicial
  if (loading && !proveedores.length && !error) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando proveedores...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando lista de proveedores...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-truck-flatbed me-3"></i>Administrar Proveedores
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
          onClick={() => handleShowModal("agregar")} // Llama a handleShowModal con el tipo "agregar"
        >
          <i className="bi bi-plus-circle-fill me-2"></i> Agregar Proveedor
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded-lg"> 
        <table className="table table-hover table-striped align-middle"> 
          <thead className="table-dark"> 
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">Correo</th>
              <th scope="col">Teléfono</th>
              <th scope="col" className="text-center" style={{ minWidth: '180px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(proveedores) && proveedores.length > 0 ? (
              proveedores.map((proveedor) => (
                <tr key={proveedor.idProveedor}>
                  <td className="fw-bold">{proveedor.idProveedor}</td>
                  <td>{proveedor.nombreProveedor}</td>
                  <td>{proveedor.emailProveedor}</td> 
                  <td>{proveedor.telefonoProveedor}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2 rounded-pill fw-semibold"
                      onClick={() => handleShowModal("editar", proveedor)}
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-pill fw-semibold"
                      onClick={() => confirmDelete(proveedor.idProveedor)} // Usa el nuevo manejador para el modal de confirmación
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted fs-5"> 
                  No se encontraron proveedores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar proveedor */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> {/* Tamaño grande */}
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${modalType === "agregar" ? "bi-plus-circle-fill" : "bi-pencil-fill"} me-2`}></i>
                  {modalType === "agregar" ? "Agregar Nuevo Proveedor" : "Editar Proveedor"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                  disabled={isSaving}
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
                    <label htmlFor="nombreProveedor" className="form-label fw-semibold">
                      <i className="bi bi-building-fill me-2"></i>Nombre del Proveedor
                    </label>
                    <input
                      type="text"
                      id="nombreProveedor"
                      className="form-control form-control-lg rounded-pill"
                      name="nombreProveedor"
                      value={formData.nombreProveedor}
                      onChange={handleChange}
                      required
                      disabled={isSaving} // Deshabilitar durante el guardado
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="emailProveedor" className="form-label fw-semibold"> 
                      <i className="bi bi-envelope-fill me-2"></i>Correo del Proveedor
                    </label>
                    <input
                      type="email"
                      id="emailProveedor" 
                      className="form-control form-control-lg rounded-pill"
                      name="emailProveedor" 
                      value={formData.emailProveedor} 
                      onChange={handleChange}
                      required
                      disabled={isSaving} // Deshabilitar durante el guardado
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="telefonoProveedor" className="form-label fw-semibold">
                      <i className="bi bi-telephone-fill me-2"></i>Teléfono del Proveedor
                    </label>
                    <input
                      type="text"
                      id="telefonoProveedor"
                      className="form-control form-control-lg rounded-pill"
                      name="telefonoProveedor"
                      value={formData.telefonoProveedor}
                      onChange={handleChange}
                      required
                      disabled={isSaving} // Deshabilitar durante el guardado
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer rounded-bottom-3">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill fw-semibold me-2"
                  onClick={handleCloseModal}
                  disabled={isSaving} // Deshabilitar durante el guardado
                >
                  <i className="bi bi-x-circle-fill me-2"></i> Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill fw-semibold"
                  onClick={handleSaveProveedor}
                  disabled={isSaving} // Deshabilitar mientras se guarda
                >
                  <i className="bi bi-save-fill me-2"></i> {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal de Confirmación de Eliminación (Custom Bootstrap Modal) */}
      {showDeleteConfirmModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-danger text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Confirmar Eliminación
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteConfirmModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="fs-5 mb-4">¿Estás seguro de que deseas eliminar este proveedor?</p>
                <p className="text-muted small">Esta acción es irreversible.</p>
              </div>
              <div className="modal-footer rounded-bottom-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill fw-semibold me-3"
                  onClick={() => setShowDeleteConfirmModal(false)}
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
