import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import adminService from "../../services/adminService"; // Para las operaciones CRUD de administradores
import rolService from "../../services/rolService";   // Para obtener la lista de roles
import { useSelector } from "react-redux"; // Para obtener el rol y ID del usuario autenticado

export default function UsuariosAdmin() {
  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal
  const [modalType, setModalType] = useState(""); // Puede ser "agregar" o "editar"
  const [formData, setFormData] = useState({
    // Campos del modelo Admin
    idAdmin: null,
    nombreAdmin: "",
    apellidoAdmin: "",
    cedulaAdmin: "",
    telefonoAdmin: "",
    // Campos del modelo Usuario (relacionado con el Admin)
    idUsuario: null, // Este es el ID principal para las operaciones de la API (PATCH, DELETE)
    email: "",
    password: "", // Opcional para editar, obligatorio para agregar
    idRol: "", // Para asignar o cambiar el rol
  });

  const [admins, setAdmins] = useState([]); // Lista de administradores que se muestra en la tabla
  const [roles, setRoles] = useState([]); // Lista de roles disponibles (ej. SuperAdmin, Admin, Cliente)
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [error, setError] = useState(null); // Estado para mensajes de error

  // Obtenemos la información del usuario autenticado desde el store de Redux para verificar permisos
  const loggedInUser = useSelector((state) => state.auth.usuario);
  const isSuperAdmin = loggedInUser && loggedInUser.rol === 'SuperAdmin';
  const loggedInUserId = loggedInUser ? loggedInUser.idUsuario : null;

  /**
   * Obtiene los roles disponibles del rolService.
   * Se utiliza para rellenar el menú desplegable de roles en el modal de agregar/editar.
   */
  const fetchRoles = async () => {
    try {
      const response = await rolService.getAllRoles();
      if (response.success && Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        console.error("La API no devolvió una lista de roles válida.");
      }
    } catch (err) {
      console.error("Error al obtener los roles:", err);
      // Podrías establecer un estado de error aquí si la carga de roles es crítica
    }
  };

  /**
   * Obtiene todos los administradores del adminService.
   * Esto actualiza la tabla con los datos más recientes de los administradores.
   */
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null); // Limpiamos errores anteriores
    try {
      const response = await adminService.getAllAdmins();
      if (response.success && Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        setError("La API no devolvió una lista de administradores válida.");
        setAdmins([]);
      }
    } catch (err) {
      console.error("Error al obtener los administradores:", err);
      setError("Error al obtener los administradores: " + (err.message || "Error desconocido."));
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  // Hook useEffect para cargar roles y administradores cuando el componente se monta
  useEffect(() => {
    fetchRoles(); // Primero carga los roles
    fetchAdmins(); // Luego carga los administradores
  }, []); // El array de dependencias vacío significa que esto se ejecuta una vez al montarse

  /**
   * Muestra el modal para agregar o editar un administrador.
   * Rellena el formData con los datos del administrador existente si es una edición.
   * @param {string} type - "agregar" o "editar".
   * @param {object} [admin=null] - El objeto administrador a editar (opcional).
   */
  const handleShowModal = (type, admin = null) => {
    setModalType(type);
    setFormData({
      idAdmin: admin ? admin.idAdmin : null,
      nombreAdmin: admin ? admin.nombreAdmin : "",
      apellidoAdmin: admin ? admin.apellidoAdmin : "",
      cedulaAdmin: admin ? admin.cedulaAdmin : "",
      telefonoAdmin: admin ? admin.telefonoAdmin : "",
      // Datos del usuario asociado
      idUsuario: admin ? admin.idUsuario : null, // Importante para actualizaciones/eliminaciones
      email: admin ? admin.email : "",
      password: "", // Nunca precargamos la contraseña por seguridad
      idRol: admin && admin.rol ? admin.rol.idRol.toString() : "", // Convertimos idRol a string para el valor del <select>
    });
    setShowModal(true);
    setError(null); // Limpiamos cualquier error antiguo al abrir el modal
  };

  /**
   * Cierra el modal y reinicia los datos del formulario y el estado de error.
   */
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
      idRol: "",
    });
    setError(null); // Limpiamos errores
  };

  /**
   * Maneja los cambios en los campos de entrada del formulario, actualizando el estado formData.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Maneja el guardado (agregar o actualizar) de un administrador.
   * Realiza la validación en el lado del cliente antes de enviar los datos a la API.
   */
  const handleSaveAdmin = async () => {
    // Validaciones básicas de frontend
    if (
      !formData.nombreAdmin.trim() ||
      !formData.apellidoAdmin.trim() ||
      !formData.cedulaAdmin.trim() ||
      !formData.telefonoAdmin.trim() ||
      !formData.email.trim() ||
      !formData.idRol // Aseguramos que se haya seleccionado un rol
    ) {
      setError("Todos los campos obligatorios (incluido el rol) deben ser completados.");
      return;
    }
    if (modalType === "agregar" && !formData.password.trim()) {
      setError("La contraseña es obligatoria para nuevos administradores.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Por favor, ingrese una dirección de correo electrónico válida.");
      return;
    }

    try {
      setLoading(true);
      let response;

      // Combinamos los datos de los modelos Admin y Usuario como espera tu API
      const adminAndUserData = {
        nombreAdmin: formData.nombreAdmin,
        apellidoAdmin: formData.apellidoAdmin,
        cedulaAdmin: formData.cedulaAdmin,
        telefonoAdmin: formData.telefonoAdmin,
        email: formData.email,
        password: formData.password,
        idRol: parseInt(formData.idRol), // Nos aseguramos de que idRol sea un número para la API
      };

      // Si el campo de contraseña está vacío durante una edición, no lo enviamos
      // para evitar cambios accidentales de contraseña
      if (modalType === "editar" && !adminAndUserData.password) {
        delete adminAndUserData.password;
      }

      if (modalType === "agregar") {
        response = await adminService.createAdmin(adminAndUserData);
        if (response.success) {
          // Volvemos a obtener la lista completa de administradores para asegurar
          // que la tabla esté actualizada después de la creación.
          await fetchAdmins();
        }
      } else { // Editando un administrador existente
        if (!formData.idUsuario) { // Necesitamos el idUsuario para la llamada a la API PATCH
          setError("ID de usuario no válido para la edición. Por favor, inténtelo de nuevo.");
          setLoading(false);
          return;
        }
        response = await adminService.updateAdmin(formData.idUsuario, adminAndUserData);
        if (response.success) {
          // Volvemos a obtener la lista completa de administradores después de la actualización
          await fetchAdmins();
        }
      }
      handleCloseModal(); // Cerramos el modal si todo fue exitoso
    } catch (err) {
      console.error("Error al guardar el administrador:", err);
      setError(err.message || 'Error al guardar el administrador. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la eliminación de un administrador. Incluye restricciones específicas para SuperAdmin.
   */
  const handleDeleteAdmin = async (adminIdToDelete, userIdToDelete) => {
    // Solo un SuperAdmin puede eliminar administradores
    if (!isSuperAdmin) {
      alert("Solo un SuperAdmin tiene permiso para eliminar administradores.");
      return;
    }

    // Un SuperAdmin no puede eliminarse a sí mismo
    if (loggedInUserId === userIdToDelete) {
      alert("Un SuperAdmin no puede eliminarse a sí mismo.");
      return;
    }

    // Opcional: Evitar eliminar al último SuperAdmin
    const targetAdmin = admins.find(a => a.idAdmin === adminIdToDelete);
    if (targetAdmin && targetAdmin.rol && targetAdmin.rol.nombreRol === 'SuperAdmin') {
      const superAdminsCount = admins.filter(a => a.rol && a.rol.nombreRol === 'SuperAdmin').length;
      if (superAdminsCount <= 1) { // Si solo queda 1 SuperAdmin (el que se intenta eliminar)
        alert("No se puede eliminar al último SuperAdmin del sistema.");
        return;
      }
    }

    if (window.confirm("¿Está seguro de que desea eliminar este administrador?")) {
      try {
        setLoading(true);
        // Llamamos al servicio para eliminar, pasando el ID DEL USUARIO
        await adminService.deleteAdmin(userIdToDelete);
        // Filtramos la lista localmente para eliminar el administrador de la UI
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.idAdmin !== adminIdToDelete));
        setError(null);
      } catch (err) {
        console.error("Error al eliminar el administrador:", err);
        setError(err.message || 'Error al eliminar el administrador.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Si está cargando y no hay administradores, mostramos un mensaje de carga
  if (loading && !admins.length && !error) {
    return <div className="container mt-4">Cargando administradores...</div>;
  }

  return (
    <div className="container mt-4">
      {/* Muestra un mensaje de error si existe y el modal no está visible */}
      {error && !showModal && (
        <div className="alert alert-danger mb-3">{error}</div>
      )}

      <h2 className="mb-3">Administradores</h2>
      {/* El botón "Agregar Administrador" solo es visible si el usuario es SuperAdmin */}
      {isSuperAdmin && (
        <button className="btn btn-success mb-3" onClick={() => handleShowModal("agregar")}>
          Agregar Administrador
        </button>
      )}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Cédula</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {admins.length > 0 ? (
            admins.map((admin) => (
              // Usamos idAdmin como key (o idUsuario si idAdmin pudiera ser nulo)
              <tr key={admin.idAdmin || admin.idUsuario}>
                <td>{admin.nombreAdmin}</td>
                <td>{admin.apellidoAdmin}</td>
                <td>{admin.cedulaAdmin}</td>
                <td>{admin.telefonoAdmin}</td>
                <td>{admin.email}</td> {/* El email ahora está directamente en el objeto mapeado */}
                <td>{admin.rol ? admin.rol.nombreRol : 'N/A'}</td> {/* Accedemos al nombre del rol */}
                <td>
                  {/* El botón "Editar" solo es visible si el usuario es SuperAdmin */}
                  {isSuperAdmin && (
                    <button className="btn btn-primary me-2" onClick={() => handleShowModal("editar", admin)}>
                      Editar
                    </button>
                  )}
                  {/* El botón "Eliminar" solo es visible si es SuperAdmin Y no es el mismo usuario logueado */}
                  {isSuperAdmin && loggedInUserId !== admin.idUsuario && (
                    <button
                      className="btn btn-danger"
                      // Pasamos tanto el idAdmin (para la clave única) como el idUsuario (para la API)
                      onClick={() => handleDeleteAdmin(admin.idAdmin, admin.idUsuario)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No hay administradores registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de Administrador */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalType === "agregar" ? "Agregar Administrador" : "Editar Administrador"}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" name="nombreAdmin" value={formData.nombreAdmin} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input type="text" className="form-control" name="apellidoAdmin" value={formData.apellidoAdmin} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cédula</label>
                    <input type="text" className="form-control" name="cedulaAdmin" value={formData.cedulaAdmin} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input type="text" className="form-control" name="telefonoAdmin" value={formData.telefonoAdmin} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                  </div>

                  {/* Campo de Contraseña - Obligatorio al agregar, opcional al editar */}
                  {(modalType === "agregar" || (modalType === "editar" && formData.password !== undefined)) && (
                    <div className="mb-3">
                      <label className="form-label">{modalType === "agregar" ? "Contraseña" : "Nueva Contraseña (opcional)"}</label>
                      <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} />
                    </div>
                  )}

                  {/* Campo de Rol - Solo es editable por un SuperAdmin */}
                  {isSuperAdmin && (
                    <div className="mb-3">
                      <label className="form-label">Rol</label>
                      <select className="form-select" name="idRol" value={formData.idRol} onChange={handleChange} required>
                        <option value="">Seleccione un rol</option>
                        {/* Mapeamos la lista de roles obtenida del servicio */}
                        {roles.map((rol) => (
                          <option key={rol.idRol} value={rol.idRol}>
                            {rol.nombreRol}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAdmin}
                  disabled={loading} // Deshabilita el botón mientras se está guardando
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}