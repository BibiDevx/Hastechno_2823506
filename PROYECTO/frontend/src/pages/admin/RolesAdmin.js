  // src/components/UsuariosRolesAdmin.js
  import React, { useState, useEffect } from "react";
  import "bootstrap/dist/css/bootstrap.min.css";
  import { Modal, Button } from "react-bootstrap"; // Importa componentes de Modal y Button de react-bootstrap

  // Importamos los servicios necesarios
  import userService from "../../services/userService"; // Para gestionar usuarios
  import rolService from "../../services/rolService";   // Para obtener la lista de roles disponibles

  export default function UsuariosRolesAdmin() {
    const [showModal, setShowModal] = useState(false);
    // Eliminamos modalType ya que siempre es "editar" en este componente
    // const [modalType, setModalType] = useState("editar"); 

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
    const [error, setError] = useState(null);

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
      // setModalType("editar"); // Ya no es necesario
      setShowModal(true);
      setError(null); // Limpiamos errores anteriores
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
      setError(null); // Limpiamos errores
    };

    // Manejador para cambios en los inputs/select del formulario del modal
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Manejador para guardar los cambios del rol de un usuario
    const handleSaveUserRole = async () => {
      // Validación de frontend: Asegurarse de que se haya seleccionado un rol
      if (!formData.idRol) {
        setError("Debe seleccionar un rol para el usuario.");
        return;
      }

      setIsSaving(true); // Activar estado de guardado
      setError(null); // Limpiar errores antes de intentar guardar

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

        handleCloseModal(); // Cierra el modal al guardar con éxito
        setError(null); // Limpia cualquier error
        alert("Rol de usuario actualizado correctamente."); // Feedback de éxito
      } catch (err) {
        console.error("Error al guardar el rol del usuario:", err);
        // Ajuste para el mensaje de error que viene del error del servicio (puede ser string o anidado)
        let errorMessage =
          err.message || "Error al actualizar el rol del usuario. Por favor, intente de nuevo.";
        if (err.response?.data?.errors) { // Si Laravel devuelve errores de validación
          const validationErrors = Object.values(err.response.data.errors)
            .flat()
            .join(" ");
          errorMessage += " " + validationErrors;
        } else if (err.response?.data?.error) { // Si el backend devuelve un solo error en la clave 'error'
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
      setError(null); // Limpiar errores previos

      try {
        // userService.deleteUser() devuelve un objeto con 'success' y 'message'
        const response = await userService.deleteUser(userToDeleteId); 
        if (response.success) {
            // Si la eliminación fue exitosa, filtra el usuario de la lista local
            setUsuarios((prevUsuarios) => prevUsuarios.filter((user) => user.idUsuario !== userToDeleteId));
            setError(null); // Limpia errores
            alert("Usuario eliminado correctamente."); // Feedback de éxito
        } else {
            // Si el backend indicó un fallo pero no lanzó un error HTTP
            throw new Error(response.message || "Fallo al eliminar el usuario.");
        }
      } catch (err) {
        console.error("Error al eliminar el usuario:", err);
        // Ajuste para el mensaje de error que viene directamente del error del servicio
        setError(err.message || "Error al eliminar el usuario.");
      } finally {
        setIsSaving(false); // Desactivar estado de guardado/eliminación
        setUserToDeleteId(null); // Limpiar ID del usuario a eliminar
      }
    };

    // Renderizado condicional para el estado de carga inicial de la tabla
    if (loading && !usuarios.length && !error) {
      return (
        <div className="container mt-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando usuarios...</span>
          </div>
          <p className="mt-2 text-muted">Cargando lista de usuarios...</p>
        </div>
      );
    }

    // Renderizado condicional para el error global (no del modal)
    if (error && !showModal && !loading) {
      return <div className="container mt-4 alert alert-danger">{error}</div>;
    }

    return (
      <div className="container mt-4">
        <h2 className="mb-4">Administrar Usuarios y Sus Roles</h2>


        <div className="table-responsive"> 
          <table className="table table-bordered table-hover shadow-sm"> 
            <thead className="table-dark"> 
              <tr>
                <th>ID Usuario</th>
                <th>Email</th>
                <th>Rol Actual</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(usuarios) && usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario.idUsuario}>
                    <td>{usuario.idUsuario}</td>
                    <td>{usuario.email}</td>
                    
                    <td>{usuario.rol ? usuario.rol.nombreRol : "Sin Rol Asignado"}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleShowModal(usuario)}
                        disabled={isSaving} // Deshabilitar durante el guardado/eliminación
                      >
                        <i className="bi bi-pencil-fill me-1"></i> Cambiar Rol
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
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
                  <td colSpan="4" className="text-center py-4 text-muted"> 
                    No se encontraron usuarios.
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
                
                  <h5 className="modal-title">Editar Rol del Usuario: {formData.email}</h5>
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
                      <label htmlFor="email" className="form-label">
                        Email del Usuario
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={formData.email}
                        disabled // El email no se edita en este modal
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="nombreRolActual" className="form-label">
                        Rol Actual
                      </label>
                      <input
                        type="text"
                        id="nombreRolActual"
                        className="form-control"
                        value={formData.nombreRolActual}
                        disabled // Solo para visualización
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="idRol" className="form-label">
                        Seleccionar Nuevo Rol
                      </label>
                      <select
                        id="idRol"
                        className="form-select"
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
                    onClick={handleSaveUserRole}
                    disabled={isSaving} // Deshabilitar mientras se guarda
                  >
                    <i className="bi bi-save-fill me-2"></i> {isSaving ? "Guardando..." : "Guardar Cambios"}
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
            ¿Estás seguro de que deseas eliminar este usuario? Esta acción es irreversible y también eliminará sus relaciones (admin/cliente).
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
