// src/components/Roles.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import rolService from "../../services/rolService"; 

export default function RolesAdmin() { // Renombrado a RolesAdmin para consistencia con los otros
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "editar" o "agregar"

  // Estado para los datos del formulario del rol
  const [formData, setFormData] = useState({
    idRol: null,
    nombreRol: "",
  });

  // Estado para la lista de roles
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true); // Para carga inicial y operaciones
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para indicar si se está guardando
  const [error, setError] = useState(null); // Para errores globales
  const [modalError, setModalError] = useState(null); // Para errores dentro del modal
  const [modalSuccess, setModalSuccess] = useState(null); // Para mensajes de éxito dentro del modal

  // Estados para el modal de confirmación de eliminación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [rolToDeleteId, setRolToDeleteId] = useState(null);

  // Función para cargar los roles desde el backend
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      // rolService.getAllRoles() ya devuelve el array de roles directamente
      const data = await rolService.getAllRoles(); 
      setRoles(data);
    } catch (err) {
      console.error("Error al cargar los roles:", err);
      // Ajuste para el mensaje de error si viene directo del error del servicio
      setError(
        "Error al cargar los roles: " + (err.message || "Error desconocido.")
      );
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []);

  // Manejador para mostrar el modal (agregar o editar)
  const handleShowModal = (type, rol = null) => {
    setModalType(type);
    setModalError(null); // Limpiar errores del modal
    setModalSuccess(null); // Limpiar mensajes de éxito del modal
    if (rol) {
      // Si se está editando, precarga los datos del rol
      setFormData({
        idRol: rol.idRol,
        nombreRol: rol.nombreRol,
      });
    } else {
      // Si se está agregando, limpia el formulario
      setFormData({
        idRol: null,
        nombreRol: "",
      });
    }
    setShowModal(true);
  };

  // Manejador para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Reinicia el formulario y errores
    setFormData({
      idRol: null,
      nombreRol: "",
    });
    setModalError(null);
    setModalSuccess(null);
  };

  // Manejador para cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador para guardar un rol (crear o actualizar)
  const handleSaveRol = async () => {
    setModalError(null); // Limpiar errores antes de guardar
    setModalSuccess(null); // Limpiar mensajes de éxito antes de guardar

    // Validaciones de frontend: El nombre del rol no puede estar vacío
    if (!formData.nombreRol.trim()) {
      setModalError("El nombre del rol es obligatorio.");
      return;
    }

    setIsSaving(true); // Activar estado de guardado

    try {
      let response;

      if (modalType === "agregar") {
        // Llama al servicio para crear un rol
        response = await rolService.createRol(formData);
        // Añade el nuevo rol a la lista de roles en el estado
        setRoles((prevRoles) => [...prevRoles, response]); 
        setModalSuccess("Rol agregado correctamente.");
      } else {
        // modalType === "editar"
        if (!formData.idRol) {
          setModalError("ID de rol no válido para editar.");
          setIsSaving(false); // Desactivar si hay un error
          return;
        }
        // Llama al servicio para actualizar un rol
        response = await rolService.updateRol(formData.idRol, formData);
        // Actualiza el rol en la lista local de roles
        setRoles((prevRoles) =>
          prevRoles.map((rol) =>
            rol.idRol === response.idRol ? response : rol
          )
        );
        setModalSuccess("Rol actualizado correctamente.");
      }

      // Opcional: Cerrar el modal al guardar con éxito después de un breve retraso
      // setTimeout(() => handleCloseModal(), 1500); 
    } catch (err) {
      console.error("Error al guardar el rol:", err);
      let errorMessage =
        err.message ||
        "Error al guardar el rol. Por favor, intente de nuevo.";
      // Si el backend devuelve errores de validación, los extraemos y mostramos
      if (err.response?.data?.error) { // Tu rolController devuelve 'error'
          if (typeof err.response.data.error === 'object') {
              const validationErrors = Object.values(err.response.data.error).flat().join(' ');
              errorMessage = "Errores de validación: " + validationErrors;
          } else {
              errorMessage = err.response.data.error; // Si es solo un mensaje de error
          }
      }
      setModalError(errorMessage); // Mostrar error en el modal
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
    }
  };

  // ✅ Manejador para mostrar el modal de confirmación de eliminación
  const confirmDelete = (id) => {
    setRolToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  // ✅ Manejador para la eliminación confirmada
  const handleDeleteConfirmed = async () => {
    setShowDeleteConfirmModal(false); // Cerrar modal de confirmación
    if (!rolToDeleteId) return;

    setIsSaving(true); // Activar estado de guardado (para operaciones de eliminación también)
    setError(null); // Limpiar errores previos (globales)

    try {
      // rolService.deleteRol() devuelve un objeto con 'success' y 'message'
      const response = await rolService.deleteRol(rolToDeleteId); 
      if (response.success) {
          // Si la eliminación fue exitosa, filtra el rol de la lista local
          setRoles((prevRoles) => prevRoles.filter((rol) => rol.idRol !== rolToDeleteId));
          // Puedes añadir un mensaje de éxito global aquí si lo deseas
      } else {
          // Si el backend indicó un fallo pero no lanzó un error HTTP
          throw new Error(response.message || "Fallo al eliminar el rol.");
      }
    } catch (err) {
      console.error("Error al eliminar el rol:", err);
      // Ajuste para el mensaje de error que viene directamente del error del servicio
      setError(
        err.message ||
        "Error al eliminar el rol. Podría tener usuarios asociados o ser un rol crítico."
      );
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
      setRolToDeleteId(null); // Limpiar ID del rol a eliminar
    }
  };

  // Renderizado condicional para el estado de carga inicial
  if (loading && !roles.length && !error) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando roles...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando lista de roles...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-person-badge-fill me-3"></i>Administrar Roles
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
          <i className="bi bi-plus-circle-fill me-2"></i> Agregar Rol
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded-lg"> 
        <table className="table table-hover table-striped align-middle"> 
          <thead className="table-dark"> 
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre del Rol</th>
              <th scope="col" className="text-center" style={{ minWidth: '180px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(roles) && roles.length > 0 ? (
              roles.map((rol) => (
                <tr key={rol.idRol}>
                  <td className="fw-bold">{rol.idRol}</td>
                  <td>{rol.nombreRol}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2 rounded-pill fw-semibold"
                      onClick={() => handleShowModal("editar", rol)}
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-pill fw-semibold"
                      onClick={() => confirmDelete(rol.idRol)} // Usa el nuevo manejador para el modal de confirmación
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted fs-5">
                  No se encontraron roles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar rol */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-md" role="document"> {/* Tamaño mediano */}
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${modalType === "agregar" ? "bi-plus-circle-fill" : "bi-pencil-fill"} me-2`}></i>
                  {modalType === "agregar" ? "Agregar Nuevo Rol" : "Editar Rol"}
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
                    <label htmlFor="nombreRol" className="form-label fw-semibold">
                      <i className="bi bi-tag-fill me-2"></i>Nombre del Rol
                    </label>
                    <input
                      type="text"
                      id="nombreRol"
                      className="form-control form-control-lg rounded-pill"
                      name="nombreRol"
                      value={formData.nombreRol}
                      onChange={handleChange}
                      disabled={isSaving} // Deshabilitar durante el guardado
                      required
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
                  onClick={handleSaveRol}
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
                <p className="fs-5 mb-4">¿Estás seguro de que deseas eliminar este rol?</p>
                <p className="text-muted small">Ten en cuenta que si hay usuarios asociados o es un rol crítico, la eliminación podría fallar.</p>
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
