// src/components/admin/UsuariosAdmin.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import adminService from "../../services/adminService"; // Asegúrate de que la ruta sea correcta

export default function UsuariosAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "editar" o "agregar"

  // Estado para los datos del formulario de administrador
  const [formData, setFormData] = useState({
    // Campos del modelo Admin
    idAdmin: null,
    nombreAdmin: "",
    apellidoAdmin: "",
    cedulaAdmin: "",
    telefonoAdmin: "",
    // Campos del modelo Usuario (relacionado)
    idUsuario: null,
    email: "",
    password: "",
    c_password: "", // Para la confirmación de contraseña en el backend
  });

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true); // Para la carga inicial y operaciones
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para indicar si se está guardando/eliminando
  const [error, setError] = useState(null); // Para errores globales
  const [modalError, setModalError] = useState(null); // Para errores dentro del modal
  const [modalSuccess, setModalSuccess] = useState(null); // Para mensajes de éxito dentro del modal

  // Estados para el modal de confirmación de eliminación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [adminToDeleteId, setAdminToDeleteId] = useState(null);

  // Función para cargar los administradores
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllAdmins();
      if (response.success && Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        setError("La API no devolvió una lista de administradores válida.");
        setAdmins([]); // Asegurarse de que admins sea un array vacío
      }
    } catch (err) {
      console.error("Error al cargar los administradores:", err);
      setError(
        "Error al cargar los administradores: " +
          (err.response?.data?.message || err.message || "Error desconocido.")
      );
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los administradores al montar el componente
  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleShowModal = (type, admin = null) => {
    setModalType(type);
    setModalError(null); // Limpiar errores previos al abrir el modal
    setModalSuccess(null); // Limpiar mensajes de éxito previos al abrir el modal
    if (admin) {
      setFormData({
        idAdmin: admin.idAdmin,
        nombreAdmin: admin.nombreAdmin,
        apellidoAdmin: admin.apellidoAdmin,
        cedulaAdmin: admin.cedulaAdmin,
        telefonoAdmin: admin.telefonoAdmin,
        idUsuario: admin.idUsuario,
        email: admin.usuario ? admin.usuario.email : "", // Leer el email del objeto 'usuario' anidado
        password: "", // Siempre en blanco para que el usuario ingrese una nueva si desea
        c_password: "", // Resetear también la confirmación
      });
    } else {
      setFormData({
        idAdmin: null,
        nombreAdmin: "",
        apellidoAdmin: "",
        cedulaAdmin: "",
        telefonoAdmin: "",
        idUsuario: null,
        email: "",
        password: "",
        c_password: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      idAdmin: null,
      nombreAdmin: "",
      apellidoAdmin: "",
      cedulaAdmin: "",
      telefonoAdmin: "",
      idUsuario: null,
      email: "",
      password: "",
      c_password: "",
    });
    setModalError(null); // Limpiar errores al cerrar el modal
    setModalSuccess(null); // Limpiar mensajes de éxito al cerrar el modal
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAdmin = async () => {
    setModalError(null); // Limpiar errores antes de guardar
    setModalSuccess(null); // Limpiar mensajes de éxito antes de guardar
    setIsSaving(true); // Activar estado de guardado

    // Validaciones de frontend
    if (
      !formData.nombreAdmin.trim() ||
      !formData.apellidoAdmin.trim() ||
      !formData.email.trim() ||
      !formData.telefonoAdmin.trim() ||
      !formData.cedulaAdmin.trim()
    ) {
      setModalError("Todos los campos obligatorios deben ser completados.");
      setIsSaving(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setModalError("Por favor, ingrese un correo electrónico válido.");
      setIsSaving(false);
      return;
    }
    // Validación de teléfono para 10 dígitos (ajusta según tu necesidad)
    if (!/^\d{10}$/.test(formData.telefonoAdmin)) {
      setModalError("El teléfono debe contener exactamente 10 dígitos numéricos.");
      setIsSaving(false);
      return;
    }

    // Validación específica para 'agregar' (la contraseña y c_password son obligatorias)
    if (modalType === "agregar") {
      if (!formData.password.trim()) {
        setModalError("La contraseña es obligatoria para agregar un nuevo administrador.");
        setIsSaving(false);
        return;
      }
      if (formData.password !== formData.c_password) {
        setModalError("La contraseña y la confirmación de contraseña no coinciden.");
        setIsSaving(false);
        return;
      }
    } else { // Validaciones para 'editar'
      if (formData.password.trim() !== '' && formData.password !== formData.c_password) {
        setModalError("La nueva contraseña y su confirmación no coinciden.");
        setIsSaving(false);
        return;
      }
    }

    try {
      let response;
      const dataToSend = { ...formData };

      if (modalType === "agregar") {
        response = await adminService.registerAdmin(dataToSend);

        if (response.admin) {
          setAdmins((prevAdmins) => [...prevAdmins, response.admin]);
          setModalSuccess("Administrador agregado correctamente."); // Feedback de éxito
        } else {
          throw new Error("Respuesta inesperada del servidor al registrar el administrador.");
        }
      } else {
        // modalType === "editar"
        if (!formData.idAdmin) {
          setModalError("ID de administrador no válido para editar.");
          setIsSaving(false); 
          return;
        }

        // Eliminar IDs y c_password si no se van a usar en el PATCH para edición
        delete dataToSend.idAdmin;
        delete dataToSend.idUsuario; 
        if (!dataToSend.password) { // Si no se provee nueva contraseña
          delete dataToSend.password;
          delete dataToSend.c_password; 
        }

        response = await adminService.updateAdmin(formData.idAdmin, dataToSend);
        
        // Asumo que tu updateAdmin en backend devuelve el admin actualizado en 'response.data' directamente
        // o si sigue BaseController, en response.data.data
        const updatedAdmin = response.data || response; // Adaptar según la estructura de tu servicio
        
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin.idAdmin === updatedAdmin.idAdmin ? updatedAdmin : admin
          )
        );
        setModalSuccess("Administrador actualizado correctamente."); // Feedback de éxito
      }

      // Opcional: Cerrar modal al guardar con éxito después de un breve retraso
      // setTimeout(() => handleCloseModal(), 1500); 
    } catch (err) {
      console.error("Error al guardar el administrador:", err);
      let errorMessage =
        err.response?.data?.message ||
        "Error al guardar el administrador. Por favor, intente de nuevo.";
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors)
          .flat()
          .join(" ");
        errorMessage = "Errores de validación: " + validationErrors;
      } else if (err.response?.data?.error) { 
          if (typeof err.response.data.error === 'object') {
              const validationErrors = Object.values(err.response.data.error).flat().join(' ');
              errorMessage = "Errores de validación: " + validationErrors;
          } else {
              errorMessage = err.response.data.error; 
          }
      }
      setModalError(errorMessage); // Mostrar error en el modal
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
    }
  };

  // Manejador para mostrar el modal de confirmación de eliminación
  const confirmDelete = (id) => {
    setAdminToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  // Manejador para la eliminación confirmada
  const handleDeleteConfirmed = async () => {
    setShowDeleteConfirmModal(false); // Cerrar modal de confirmación
    if (!adminToDeleteId) return;

    setIsSaving(true); // Activar estado de guardado/eliminación
    setError(null); // Limpiar errores previos (globales)

    try {
      const response = await adminService.deleteAdmin(adminToDeleteId);
      if (response.success) {
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.idAdmin !== adminToDeleteId));
        // Puedes añadir un mensaje de éxito global aquí si lo deseas
      } else {
        throw new Error(response.message || "Fallo al eliminar el administrador.");
      }
    } catch (err) {
      console.error("Error al eliminar el administrador:", err);
      setError(err.response?.data?.message || "Error al eliminar el administrador."); // Mostrar error global
    } finally {
      setIsSaving(false); // Desactivar estado de guardado/eliminación
      setAdminToDeleteId(null); // Limpiar ID del admin a eliminar
    }
  };

  // Renderizado condicional para el estado de carga inicial
  if (loading && !admins.length && !error) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando administradores...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando lista de administradores...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-person-gear-fill me-3"></i>Administrar Administradores
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
          <i className="bi bi-person-plus-fill me-2"></i> Agregar Administrador
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded-lg"> 
        <table className="table table-hover table-striped align-middle"> 
          <thead className="table-dark">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">Apellido</th>
              <th scope="col">Cédula</th>
              <th scope="col">Correo</th>
              <th scope="col">Teléfono</th>
              <th scope="col" className="text-center" style={{ minWidth: '180px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(admins) && admins.length > 0 ? (
              admins.map((admin) => (
                <tr key={admin.idAdmin}>
                  <td className="fw-bold">{admin.idAdmin}</td>
                  <td>{admin.nombreAdmin}</td>
                  <td>{admin.apellidoAdmin}</td>
                  <td>{admin.cedulaAdmin}</td>
                  <td>{admin.usuario ? admin.usuario.email : "N/A"}</td>
                  <td>{admin.telefonoAdmin}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2 rounded-pill fw-semibold"
                      onClick={() => handleShowModal("editar", admin)}
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-pill fw-semibold"
                      onClick={() => confirmDelete(admin.idAdmin)} // Usa el nuevo manejador para el modal de confirmación
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted fs-5"> 
                  No se encontraron administradores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar administrador */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> {/* Tamaño grande */}
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${modalType === "agregar" ? "bi-person-plus-fill" : "bi-pencil-fill"} me-2`}></i>
                  {modalType === "agregar"
                    ? "Agregar Nuevo Administrador"
                    : "Editar Administrador"}
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
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="nombreAdmin" className="form-label fw-semibold">
                        <i className="bi bi-person-fill me-2"></i>Nombre
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-pill"
                        id="nombreAdmin"
                        name="nombreAdmin"
                        value={formData.nombreAdmin}
                        onChange={handleChange}
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="apellidoAdmin" className="form-label fw-semibold">
                        <i className="bi bi-person-fill me-2"></i>Apellido
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-pill"
                        id="apellidoAdmin"
                        name="apellidoAdmin"
                        value={formData.apellidoAdmin}
                        onChange={handleChange}
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cedulaAdmin" className="form-label fw-semibold">
                      <i className="bi bi-credit-card-fill me-2"></i>Cédula
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      id="cedulaAdmin"
                      name="cedulaAdmin"
                      value={formData.cedulaAdmin}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="bi bi-envelope-fill me-2"></i>Correo
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg rounded-pill"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="telefonoAdmin" className="form-label fw-semibold">
                      <i className="bi bi-telephone-fill me-2"></i>Teléfono
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      id="telefonoAdmin"
                      name="telefonoAdmin"
                      value={formData.telefonoAdmin}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <i className="bi bi-lock-fill me-2"></i>
                      {modalType === "agregar"
                        ? "Contraseña"
                        : "Nueva Contraseña (opcional)"}
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg rounded-pill"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={modalType === "agregar"}
                      disabled={isSaving}
                    />
                  </div>
                  
                  {(modalType === "agregar" || formData.password.trim() !== '') && (
                    <div className="mb-3">
                      <label htmlFor="c_password" className="form-label fw-semibold">
                        <i className="bi bi-lock-fill me-2"></i>Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg rounded-pill"
                        id="c_password"
                        name="c_password"
                        value={formData.c_password}
                        onChange={handleChange}
                        required={modalType === "agregar" || formData.password.trim() !== ''}
                        disabled={isSaving}
                      />
                    </div>
                  )}
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
                  onClick={handleSaveAdmin}
                  disabled={isSaving}
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
                <p className="fs-5 mb-4">¿Estás seguro de que deseas eliminar este administrador y su usuario asociado?</p>
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
