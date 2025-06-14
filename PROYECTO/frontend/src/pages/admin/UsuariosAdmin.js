// src/components/UsuariosAdmin.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap"; // Importa componentes de Modal y Button de react-bootstrap
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
  const [error, setError] = useState(null);

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
        c_password: "", // Limpiar también la confirmación
      });
    }
    setShowModal(true);
    setError(null); // Limpiar errores previos al abrir el modal
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
    setError(null); // Limpiar errores al cerrar el modal
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAdmin = async () => {
    // Validaciones de frontend
    if (
      !formData.nombreAdmin.trim() ||
      !formData.apellidoAdmin.trim() ||
      !formData.email.trim() ||
      !formData.telefonoAdmin.trim() ||
      !formData.cedulaAdmin.trim()
    ) {
      setError("Todos los campos obligatorios deben ser completados.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Por favor, ingrese un correo electrónico válido.");
      return;
    }
    // Validación de teléfono para 10 dígitos (ajusta según tu necesidad)
    if (!/^\d{10}$/.test(formData.telefonoAdmin)) {
      setError("El teléfono debe contener exactamente 10 dígitos numéricos.");
      return;
    }

    // Validación específica para 'agregar' (la contraseña y c_password son obligatorias)
    if (modalType === "agregar") {
      if (!formData.password.trim()) {
        setError("La contraseña es obligatoria para agregar un nuevo administrador.");
        return;
      }
      if (formData.password !== formData.c_password) {
        setError("La contraseña y la confirmación de contraseña no coinciden.");
        return;
      }
    } else { // Validaciones para 'editar'
      if (formData.password.trim() !== '' && formData.password !== formData.c_password) {
        setError("La nueva contraseña y su confirmación no coinciden.");
        return;
      }
    }

    setIsSaving(true); // Activar estado de guardado
    setError(null); // Limpiar errores antes de intentar guardar

    try {
      let response;
      const dataToSend = { ...formData };

      if (modalType === "agregar") {
        response = await adminService.registerAdmin(dataToSend);

        if (response.admin) {
          setAdmins((prevAdmins) => [...prevAdmins, response.admin]);
          alert("Administrador agregado correctamente."); // Feedback de éxito
        } else {
          throw new Error("Respuesta inesperada del servidor al registrar el administrador.");
        }
      } else {
        // modalType === "editar"
        if (!formData.idAdmin) {
          setError("ID de administrador no válido para editar.");
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
        alert("Administrador actualizado correctamente."); // Feedback de éxito
      }

      handleCloseModal(); // Cerrar modal al guardar con éxito
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
      setError(errorMessage);
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
      setLoading(false); // Asegurarse de que se resetea el loading
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
    setError(null); // Limpiar errores previos

    try {
      const response = await adminService.deleteAdmin(adminToDeleteId);
      if (response.success) {
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.idAdmin !== adminToDeleteId));
        setError(null);
        alert("Administrador eliminado correctamente."); // Feedback de éxito
      } else {
        throw new Error(response.message || "Fallo al eliminar el administrador.");
      }
    } catch (err) {
      console.error("Error al eliminar el administrador:", err);
      setError(err.response?.data?.message || "Error al eliminar el administrador.");
    } finally {
      setIsSaving(false); // Desactivar estado de guardado/eliminación
      setLoading(false); // Asegurarse de que se resetea el loading
      setAdminToDeleteId(null); // Limpiar ID del admin a eliminar
    }
  };

  // Renderizado condicional para el estado de carga inicial
  if (loading && !admins.length && !error) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando administradores...</span>
        </div>
        <p className="mt-2 text-muted">Cargando lista de administradores...</p>
      </div>
    );
  }

  // Renderizado condicional para el error global (no del modal)
  if (error && !showModal && !loading) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Administradores</h2>

     
      <button 
        className="btn btn-success mb-3" 
        onClick={() => handleShowModal("agregar")}
      >
        <i className="bi bi-person-plus-fill me-2"></i> Agregar Administrador
      </button>

      <div className="table-responsive"> 
        <table className="table table-bordered table-hover shadow-sm"> 
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cédula</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(admins) && admins.length > 0 ? (
              admins.map((admin) => (
                <tr key={admin.idAdmin}>
                  <td>{admin.idAdmin}</td>
                  <td>{admin.nombreAdmin}</td>
                  <td>{admin.apellidoAdmin}</td>
                  <td>{admin.cedulaAdmin}</td>
                  <td>{admin.usuario ? admin.usuario.email : "N/A"}</td>
                  <td>{admin.telefonoAdmin}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleShowModal("editar", admin)}
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
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
                <td colSpan="7" className="text-center py-4 text-muted"> 
                  No se encontraron administradores.
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
                  {modalType === "agregar"
                    ? "Agregar Administrador"
                    : "Editar Administrador"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                  disabled={isSaving} // Deshabilitar durante el guardado
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-3">
                    <label htmlFor="nombreAdmin" className="form-label">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombreAdmin"
                      className="form-control"
                      name="nombreAdmin"
                      value={formData.nombreAdmin}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="apellidoAdmin" className="form-label">
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="apellidoAdmin"
                      className="form-control"
                      name="apellidoAdmin"
                      value={formData.apellidoAdmin}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cedulaAdmin" className="form-label">
                      Cédula
                    </label>
                    <input
                      type="text"
                      id="cedulaAdmin"
                      className="form-control"
                      name="cedulaAdmin"
                      value={formData.cedulaAdmin}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Correo
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="telefonoAdmin" className="form-label">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      id="telefonoAdmin"
                      className="form-control"
                      name="telefonoAdmin"
                      value={formData.telefonoAdmin}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      {modalType === "agregar"
                        ? "Contraseña"
                        : "Nueva Contraseña (opcional)"}
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={modalType === "agregar"}
                      disabled={isSaving}
                    />
                  </div>
                 
                  {(modalType === "agregar" || formData.password.trim() !== '') && (
                    <div className="mb-3">
                      <label htmlFor="c_password" className="form-label">
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        id="c_password"
                        className="form-control"
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
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  className="rounded-pill fw-semibold me-2"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  <i className="bi bi-x-circle-fill me-2"></i> Cerrar
                </Button>
                <Button
                  variant="primary"
                  className="rounded-pill fw-semibold"
                  onClick={handleSaveAdmin}
                  disabled={isSaving}
                >
                  <i className="bi bi-save-fill me-2"></i> {isSaving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i> Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este administrador y su usuario asociado? Esta acción es irreversible.
        </Modal.Body>
        <Modal.Footer className="justify-content-end">
          <Button 
            variant="secondary" 
            className="rounded-pill fw-semibold" 
            onClick={() => setShowDeleteConfirmModal(false)}
            disabled={isSaving}
          >
            Cerrar
          </Button>
          <Button 
            variant="danger" 
            className="rounded-pill fw-semibold" 
            onClick={handleDeleteConfirmed}
            disabled={isSaving}
          >
            <i className="bi bi-trash-fill me-1"></i> Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
