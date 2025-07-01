// src/components/admin/UsuariosRolesAdmin.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Importamos los servicios necesarios
import userService from "../../services/userService"; // Para gestionar usuarios
import rolService from "../../services/rolService";   // Para obtener la lista de roles disponibles

export default function UsuariosRolesAdmin() {
  const [showModal, setShowModal] = useState(false);

  // Estado para los datos del formulario, ahora enfocado en el usuario y su rol
  const [formData, setFormData] = useState({
    idUsuario: null,
    email: "",
    idRol: "", // El ID del rol que se va a editar
    nombreRolActual: "", // Para mostrar el nombre del rol actual en el modal
  });

  // Estado para la lista de usuarios
  const [usuarios, setUsuarios] = useState([]); 
  // Estado para la lista de roles disponibles para el selector del modal
  const [rolesDisponibles, setRolesDisponibles] = useState([]); 
  
  const [loading, setLoading] = useState(true); // Para la carga inicial de datos
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para operaciones de guardar/eliminar
  const [error, setError] = useState(null); // Para errores globales
  const [modalError, setModalError] = useState(null); // Para errores dentro del modal
  const [modalSuccess, setModalSuccess] = useState(null); // Para mensajes de éxito dentro del modal

  // Estados para el modal de confirmación de eliminación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);

  // Función para cargar la lista de usuarios con sus roles asociados
  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      // userService.getAllUsersWithRoles() devuelve un array de usuarios, cada uno con su objeto 'rol' anidado
      const data = await userService.getAllUsersWithRoles();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al cargar los usuarios:", err);
      // Ajuste para el mensaje de error que viene directamente del error del servicio
      setError(
        "Error al cargar los usuarios: " + (err.message || "Error desconocido.")
      );
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar todos los roles disponibles para el dropdown del modal
  const fetchRolesDisponibles = async () => {
    try {
      // rolService.getAllRoles() devuelve directamente el array de roles
      const data = await rolService.getAllRoles(); 
      setRolesDisponibles(data);
    } catch (err) {
      console.error("Error al cargar roles disponibles:", err);
      // Ajuste para el mensaje de error que viene directamente del error del servicio
      setError("No se pudieron cargar los roles disponibles para la edición: " + (err.message || "Error desconocido."));
    }
  };

  // Efecto para cargar usuarios y roles disponibles al montar el componente
  useEffect(() => {
    fetchUsuarios();
    fetchRolesDisponibles();
  }, []); // Dependencias vacías para que se ejecute solo al montar

  // Manejador para mostrar el modal de edición de rol para un usuario específico
  const handleShowModal = (usuario) => {
    // Al abrir el modal, precargamos los datos del usuario y su rol actual
    setFormData({
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      idRol: usuario.idRol, // El ID del rol actual del usuario
      nombreRolActual: usuario.rol ? usuario.rol.nombreRol : "Sin Rol", // Nombre del rol para mostrar
    });
    setShowModal(true);
    setModalError(null); // Limpiamos errores anteriores del modal
    setModalSuccess(null); // Limpiamos mensajes de éxito anteriores del modal
  };

  // Manejador para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Reinicia el formulario a su estado inicial
    setFormData({
      idUsuario: null,
      email: "",
      idRol: "",
      nombreRolActual: "",
    });
    setModalError(null); // Limpiamos errores del modal
    setModalSuccess(null); // Limpiamos mensajes de éxito del modal
  };

  // Manejador para cambios en los inputs/select del formulario del modal
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador para guardar los cambios del rol de un usuario
  const handleSaveUserRole = async () => {
    setModalError(null); // Limpiar errores antes de guardar
    setModalSuccess(null); // Limpiar mensajes de éxito antes de guardar

    // Validación de frontend: Asegurarse de que se haya seleccionado un rol
    if (!formData.idRol) {
      setModalError("Debe seleccionar un rol para el usuario.");
      setIsSaving(false); // Asegurarse de desactivar el guardado si hay un error de validación
      return;
    }

    setIsSaving(true); // Activar estado de guardado

    try {
      // Llama al servicio para actualizar el rol del usuario
      // Se envía el idUsuario y el nuevo idRol
      const updatedUser = await userService.updateUserRole(
        formData.idUsuario,
        formData.idRol
      );

      // Actualiza la lista de usuarios en el estado para reflejar el cambio
      // 'updatedUser' ya debe incluir el objeto 'rol' actualizado gracias al backend
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((user) =>
          user.idUsuario === updatedUser.idUsuario ? updatedUser : user
        )
      );

      setModalSuccess("Rol de usuario actualizado correctamente."); // Feedback de éxito
      // Opcional: Cierra el modal al guardar con éxito después de un breve retraso
      // setTimeout(() => handleCloseModal(), 1500); 
    } catch (err) {
      console.error("Error al guardar el rol del usuario:", err);
      // Ajuste para el mensaje de error que viene del error del servicio (puede ser string o anidado)
      let errorMessage =
        err.message || "Error al actualizar el rol del usuario. Por favor, intente de nuevo.";
      if (err.response?.data?.errors) { // Si Laravel devuelve errores de validación
        const validationErrors = Object.values(err.response.data.errors)
          .flat()
          .join(" ");
        errorMessage = "Errores de validación: " + validationErrors;
      } else if (err.response?.data?.error) { // Si el backend devuelve un solo error en la clave 'error'
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

  // Manejador para mostrar el modal de confirmación de eliminación
  const confirmDelete = (id) => {
    setUserToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  // Manejador para la eliminación confirmada
  const handleDeleteConfirmed = async () => {
    setShowDeleteConfirmModal(false); // Cerrar modal de confirmación
    if (!userToDeleteId) return;

    setIsSaving(true); // Activar estado de guardado/eliminación
    setError(null); // Limpiar errores previos (globales)

    try {
      // userService.deleteUser() devuelve un objeto con 'success' y 'message'
      const response = await userService.deleteUser(userToDeleteId); 
      if (response.success) {
          // Si la eliminación fue exitosa, filtra el usuario de la lista local
          setUsuarios((prevUsuarios) => prevUsuarios.filter((user) => user.idUsuario !== userToDeleteId));
          // Puedes añadir un mensaje de éxito global aquí si lo deseas
      } else {
          // Si el backend indicó un fallo pero no lanzó un error HTTP
          throw new Error(response.message || "Fallo al eliminar el usuario.");
      }
    } catch (err) {
      console.error("Error al eliminar el usuario:", err);
      // Ajuste para el mensaje de error que viene directamente del error del servicio
      setError(err.message || "Error al eliminar el usuario."); // Mostrar error global
    } finally {
      setIsSaving(false); // Desactivar estado de guardado/eliminación
      setUserToDeleteId(null); // Limpiar ID del usuario a eliminar
    }
  };

  // Renderizado condicional para el estado de carga inicial de la tabla
  if (loading && !usuarios.length && !error) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando usuarios...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando lista de usuarios...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-person-lines-fill me-3"></i>Administrar Usuarios y Roles
      </h1>

      {/* Mensaje de error global (si no hay modal abierto) */}
      {error && !showModal && (
        <div className="alert alert-danger text-center animated fadeIn mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      <div className="table-responsive shadow-sm rounded-lg"> 
        <table className="table table-hover table-striped align-middle"> 
          <thead className="table-dark"> 
            <tr>
              <th scope="col">ID Usuario</th>
              <th scope="col">Email</th>
              <th scope="col">Rol Actual</th>
              <th scope="col" className="text-center" style={{ minWidth: '220px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(usuarios) && usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <tr key={usuario.idUsuario}>
                  <td className="fw-bold">{usuario.idUsuario}</td>
                  <td>{usuario.email}</td>
                  
                  <td>
                    {usuario.rol ? (
                      <span className={`badge ${
                        usuario.rol.nombreRol === 'Admin' ? 'bg-primary' :
                        usuario.rol.nombreRol === 'SuperAdmin' ? 'bg-danger' :
                        usuario.rol.nombreRol === 'Cliente' ? 'bg-success' :
                        'bg-secondary'
                      } py-2 px-3 rounded-pill`}>
                        {usuario.rol.nombreRol}
                      </span>
                    ) : (
                      <span className="badge bg-secondary py-2 px-3 rounded-pill">Sin Rol Asignado</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2 rounded-pill fw-semibold"
                      onClick={() => handleShowModal(usuario)}
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Cambiar Rol
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-pill fw-semibold"
                      onClick={() => confirmDelete(usuario.idUsuario)} // Usa el nuevo manejador para el modal de confirmación
                      disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar Usuario
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted fs-5"> 
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para editar rol de usuario */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-md" role="document"> {/* Tamaño mediano */}
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-fill me-2"></i> Editar Rol del Usuario: {formData.email}
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
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="bi bi-envelope-fill me-2"></i>Email del Usuario
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control form-control-lg rounded-pill"
                      value={formData.email}
                      disabled // El email no se edita en este modal
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nombreRolActual" className="form-label fw-semibold">
                      <i className="bi bi-person-badge-fill me-2"></i>Rol Actual
                    </label>
                    <input
                      type="text"
                      id="nombreRolActual"
                      className="form-control form-control-lg rounded-pill"
                      value={formData.nombreRolActual}
                      disabled // Solo para visualización
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="idRol" className="form-label fw-semibold">
                      <i className="bi bi-arrow-right-square-fill me-2"></i>Seleccionar Nuevo Rol
                    </label>
                    <select
                      id="idRol"
                      className="form-select form-control-lg rounded-pill"
                      name="idRol"
                      value={formData.idRol}
                      onChange={handleChange}
                      required
                      disabled={isSaving} // Deshabilitar durante el guardado
                    >
                      <option value="">-- Seleccione un Rol --</option>
                      {rolesDisponibles.map((rol) => (
                        <option key={rol.idRol} value={rol.idRol}>
                          {rol.nombreRol}
                        </option>
                      ))}
                    </select>
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
                  onClick={handleSaveUserRole}
                  disabled={isSaving} // Deshabilitar mientras se guarda
                >
                  <i className="bi bi-save-fill me-2"></i> {isSaving ? "Guardando..." : "Guardar Cambios"}
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
                <p className="fs-5 mb-4">¿Estás seguro de que deseas eliminar este usuario?</p>
                <p className="text-muted small">Esta acción es irreversible y también eliminará sus relaciones (admin/cliente).</p>
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
