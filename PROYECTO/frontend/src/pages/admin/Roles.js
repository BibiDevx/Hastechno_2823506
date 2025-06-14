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
  const [error, setError] = useState(null);

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
    setError(null); // Limpia errores anteriores al abrir el modal
  };

  // Manejador para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Reinicia el formulario y errores
    setFormData({
      idRol: null,
      nombreRol: "",
    });
    setError(null);
  };

  // Manejador para cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador para guardar un rol (crear o actualizar)
  const handleSaveRol = async () => {
    // Validaciones de frontend: El nombre del rol no puede estar vacío
    if (!formData.nombreRol.trim()) {
      setError("El nombre del rol es obligatorio.");
      return;
    }

    setIsSaving(true); // Activar estado de guardado
    setError(null); // Limpiar errores antes de intentar guardar

    try {
      let response;

      if (modalType === "agregar") {
        // Llama al servicio para crear un rol
        response = await rolService.createRol(formData);
        // Añade el nuevo rol a la lista de roles en el estado
        setRoles((prevRoles) => [...prevRoles, response]); 
        alert("Rol agregado correctamente.");
      } else {
        // modalType === "editar"
        if (!formData.idRol) {
          setError("ID de rol no válido para editar.");
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
        alert("Rol actualizado correctamente.");
      }

      handleCloseModal(); // Cierra el modal al guardar con éxito
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
      setError(errorMessage);
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
      setLoading(false); // Asegurarse de que se resetea el loading
    }
  };

  // Manejador para eliminar un rol
  const handleDeleteRol = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este rol? Ten en cuenta que si hay usuarios asociados o es un rol crítico, la eliminación podría fallar."
      )
    ) {
      setIsSaving(true); // Activar estado de guardado (para operaciones de eliminación también)
      setError(null); // Limpiar errores previos
      try {
        // rolService.deleteRol() devuelve un objeto con 'success' y 'message'
        const response = await rolService.deleteRol(id); 
        if (response.success) {
            // Si la eliminación fue exitosa, filtra el rol de la lista local
            setRoles((prevRoles) => prevRoles.filter((rol) => rol.idRol !== id));
            setError(null); // Limpia errores
            alert("Rol eliminado correctamente.");
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
        setLoading(false); // Asegurarse de que se resetea el loading
      }
    }
  };

  // Renderizado condicional para el estado de carga inicial
  if (loading && !roles.length && !error) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando roles...</span>
        </div>
        <p className="mt-2 text-muted">Cargando lista de roles...</p>
      </div>
    );
  }

  // Renderizado condicional para el error global (no del modal)
  if (error && !showModal && !loading) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Roles</h2>

      
      <button 
        className="btn btn-success mb-3" 
        onClick={() => handleShowModal("agregar")} // Llama a handleShowModal con el tipo "agregar"
      >
        <i className="bi bi-plus-circle-fill me-2"></i> Agregar Rol
      </button>

      <div className="table-responsive"> 
        <table className="table table-bordered table-hover shadow-sm"> 
          <thead className="table-dark"> 
            <tr>
              <th>ID</th>
              <th>Nombre del Rol</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(roles) && roles.length > 0 ? (
              roles.map((rol) => (
                <tr key={rol.idRol}>
                  <td>{rol.idRol}</td>
                  <td>{rol.nombreRol}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleShowModal("editar", rol)}
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteRol(rol.idRol)}
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted">
                  No se encontraron roles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

     
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {modalType === "agregar" ? "Agregar Rol" : "Editar Rol"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                  disabled={isSaving}
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-3">
                    <label htmlFor="nombreRol" className="form-label">
                      Nombre del Rol
                    </label>
                    <input
                      type="text"
                      id="nombreRol"
                      className="form-control"
                      name="nombreRol"
                      value={formData.nombreRol}
                      onChange={handleChange}
                      disabled={isSaving} // Deshabilitar durante el guardado
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
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
    </div>
  );
}
