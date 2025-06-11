// src/components/UsuariosAdmin.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import adminService from "../../services/adminService"; // Asegúrate de que la ruta sea correcta

export default function UsuariosAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "editar" o "agregar"

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
    c_password: "", // ¡NUEVO CAMPO! Para la confirmación de contraseña en el backend
  });

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los administradores
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllAdmins();
      if (response.success && Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        // Mejorar el manejo si la respuesta no es una lista válida
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
        email: admin.usuario ? admin.usuario.email : "", // Conservamos esta lógica para leer el email del objeto 'usuario' anidado
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
    setError(null);
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
    setError(null);
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
    // Añadida validación de teléfono para 10 dígitos, si tu backend lo exige
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
    }

    try {
      setLoading(true);
      let response;
      const dataToSend = { ...formData };

      if (modalType === "agregar") {
        // Para agregar, enviamos todos los datos, incluyendo la contraseña y c_password
        // Asegúrate de que adminService.registerAdmin acepte estos campos
        response = await adminService.registerAdmin(dataToSend);

        // *** CAMBIO CRÍTICO AQUÍ: Ajustar la forma de acceder a los datos de la respuesta
        // Tu backend devuelve { message: ..., admin: { ... } }
        if (response.admin) {
          setAdmins((prevAdmins) => [...prevAdmins, response.admin]);
        } else {
          throw new Error("Respuesta inesperada del servidor al registrar el administrador.");
        }
      } else {
        // modalType === "editar"
        if (!formData.idAdmin) {
          setError("ID de administrador no válido para editar.");
          setLoading(false);
          return;
        }

        // Eliminar IDs que no deben ir en el cuerpo de la petición PATCH para edición
        delete dataToSend.idAdmin;
        delete dataToSend.idUsuario; // No se envía idUsuario en el PATCH para el admin

        // Si la contraseña o c_password están vacías en edición, no las enviamos para que el backend no las actualice.
        // Si el usuario quiere cambiarla, debe llenar AMBAS.
        if (!dataToSend.password) {
          delete dataToSend.password;
          delete dataToSend.c_password; // Asegurarse de no enviar c_password si no se envía password
        } else if (dataToSend.password !== dataToSend.c_password && dataToSend.password.trim() !== '') {
          setError("La nueva contraseña y su confirmación no coinciden.");
          setLoading(false);
          return;
        }


        // Para la edición, es posible que tu API de actualización (updateAdmin) no requiera 'c_password'
        // Por lo tanto, lo eliminamos si no se va a usar para la actualización de contraseña
        if (!dataToSend.password) {
             delete dataToSend.c_password; // Solo enviar c_password si password también se envía
        }

        response = await adminService.updateAdmin(formData.idAdmin, dataToSend);
        // La respuesta del updateAdmin debería ser el objeto admin actualizado directamente
        // Asumo que tu updateAdmin en backend devuelve el admin actualizado en 'response.data' directamente
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin.idAdmin === response.data.idAdmin ? response.data : admin
          )
        );
      }

      handleCloseModal(); // Cerrar modal al guardar con éxito
      setError(null); // Limpiar errores si el guardado fue exitoso
    } catch (err) {
      console.error("Error al guardar el administrador:", err);
      let errorMessage =
        err.response?.data?.message ||
        "Error al guardar el administrador. Por favor, intente de nuevo.";
      if (err.response?.data?.errors) {
        // Si Laravel devuelve errores de validación, mostrarlos
        const validationErrors = Object.values(err.response.data.errors)
          .flat()
          .join(" ");
        errorMessage += " " + validationErrors;
      } else if (err.response?.data?.error) { // Tu registerAdmin devuelve 'error' en lugar de 'errors'
          if (typeof err.response.data.error === 'object') {
              const validationErrors = Object.values(err.response.data.error).flat().join(' ');
              errorMessage = "Errores de validación: " + validationErrors;
          } else {
              errorMessage = err.response.data.error; // Si es solo un mensaje de error
          }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este administrador y su usuario asociado? Esta acción es irreversible."
      )
    ) {
      try {
        setLoading(true);
        await adminService.deleteAdmin(id);
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.idAdmin !== id));
        setError(null);
      } catch (err) {
        console.error("Error al eliminar el administrador:", err);
        setError(err.response?.data?.message || "Error al eliminar el administrador.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !admins.length && !error) {
    return <div className="container mt-4">Cargando administradores...</div>;
  }

  if (error && !showModal && !loading) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Administradores</h2>

      <button className="btn btn-success mb-3" onClick={() => handleShowModal("agregar")}>
        Agregar Administrador
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Cédula</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {admins.length > 0 ? (
            admins.map((admin) => (
              <tr key={admin.idAdmin}>
                <td>{admin.idAdmin}</td>
                <td>{admin.nombreAdmin}</td>
                <td>{admin.apellidoAdmin}</td>
                <td>{admin.cedulaAdmin}</td>
                <td>{admin.usuario ? admin.usuario.email : "N/A"}</td>
                <td>{admin.telefonoAdmin}</td>
                <td>
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => handleShowModal("editar", admin)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(admin.idAdmin)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No se encontraron administradores.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "agregar"
                    ? "Agregar Administrador"
                    : "Editar Administrador"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
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
                    />
                  </div>
                  {/* Campo de confirmación de contraseña, solo para agregar o cuando se quiere cambiar en edición */}
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
                      />
                    </div>
                  )}
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAdmin}
                  disabled={loading}
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