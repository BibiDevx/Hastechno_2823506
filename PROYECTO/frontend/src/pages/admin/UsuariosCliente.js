// src/components/admin/UsuariosCliente.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import clientService from "../../services/clientService";

export default function UsuariosCliente() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    idCliente: null,
    nombreCliente: "",
    apellidoCliente: "",
    cedulaCliente: "",
    telefonoCliente: "",
    direccion: "",
    idUsuario: null,
    email: "",
    password: "", // Contraseña opcional para cambiar en edición
  });

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null); // Para errores globales
  const [modalError, setModalError] = useState(null); // Para errores dentro del modal
  const [modalSuccess, setModalSuccess] = useState(null); // Para mensajes de éxito dentro del modal
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const clientesData = await clientService.getAllClients();

      if (Array.isArray(clientesData)) {
        setClientes(clientesData);
      } else {
        console.error("La API no devolvió una lista de clientes válida (no es un array).");
        setError("La API no devolvió una lista de clientes válida.");
        setClientes([]);
      }
    } catch (err) {
      console.error("Error al cargar los clientes:", err);
      setError("Error al cargar los clientes: " + (err.message || "Error desconocido."));
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleShowModal = (cliente) => {
    setShowModal(true);
    setModalError(null); // Limpiar errores del modal
    setModalSuccess(null); // Limpiar mensajes de éxito del modal
    setFormData({
      idCliente: cliente.idCliente,
      nombreCliente: cliente.nombreCliente,
      apellidoCliente: cliente.apellidoCliente,
      cedulaCliente: cliente.cedulaCliente,
      telefonoCliente: cliente.telefonoCliente,
      direccion: cliente.direccion,
      idUsuario: cliente.idUsuario,
      email: cliente.usuario ? cliente.usuario.email : "",
      password: "", // Siempre en blanco al abrir para edición
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      idCliente: null,
      nombreCliente: "",
      apellidoCliente: "",
      cedulaCliente: "",
      telefonoCliente: "",
      direccion: "",
      idUsuario: null,
      email: "",
      password: "",
    });
    setModalError(null);
    setModalSuccess(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveCliente = async () => {
    setModalError(null);
    setModalSuccess(null);
    setIsSaving(true);

    // Validaciones de frontend
    if (
      !formData.nombreCliente.trim() ||
      !formData.apellidoCliente.trim() ||
      !formData.email.trim() ||
      !formData.telefonoCliente.trim() ||
      !formData.cedulaCliente.trim() ||
      !formData.direccion.trim()
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
    if (formData.password && formData.password.length < 6) {
      setModalError("La nueva contraseña debe tener al menos 6 caracteres.");
      setIsSaving(false);
      return;
    }

    try {
      const dataToSend = { ...formData };
      delete dataToSend.idCliente;
      delete dataToSend.idUsuario;

      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      const updatedCliente = await clientService.updateClient(formData.idCliente, dataToSend);

      if (updatedCliente && updatedCliente.idCliente) {
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>
            cliente.idCliente === updatedCliente.idCliente ? updatedCliente : cliente
          )
        );
        setModalSuccess("Cliente actualizado correctamente.");
        // Opcional: cerrar el modal después de un breve tiempo
        // setTimeout(() => handleCloseModal(), 1500);
      } else {
        throw new Error("No se pudo actualizar el cliente. Respuesta de la API inválida.");
      }
    } catch (err) {
      console.error("Error al guardar el cliente:", err);
      setModalError(err.message || 'Error al guardar el cliente. Por favor, intente de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Función para mostrar el modal de confirmación de eliminación
  const confirmDelete = (id) => {
    setClientToDelete(id);
    setShowConfirmDeleteModal(true);
  };

  // ✅ Función para ejecutar la eliminación después de la confirmación
  const handleDeleteConfirmed = async () => {
    setShowConfirmDeleteModal(false); // Cerrar el modal de confirmación
    if (!clientToDelete) return;

    setIsSaving(true); // Activar estado de guardado (para operaciones de eliminación también)
    setError(null); // Limpiar errores previos
    try {
      const response = await clientService.deleteClient(clientToDelete);

      if (response.success) {
        setClientes((prevClientes) => prevClientes.filter((cliente) => cliente.idCliente !== clientToDelete));
        // Puedes añadir un mensaje de éxito global aquí si lo deseas
      } else {
        throw new Error(response.message || "Fallo al eliminar el cliente.");
      }
    } catch (err) {
      console.error("Error al eliminar el cliente:", err);
      setError(err.message || 'Error al eliminar el cliente.');
    } finally {
      setIsSaving(false);
      setClientToDelete(null); // Limpiar el ID del cliente a eliminar
    }
  };

  // Renderizado condicional para el estado de carga inicial
  if (loading && !clientes.length && !error) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando clientes...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando lista de clientes...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-people-fill me-3"></i>Administrar Clientes
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
              <th scope="col">Nombre</th>
              <th scope="col">Apellido</th>
              <th scope="col">Cédula</th>
              <th scope="col">Correo</th>
              <th scope="col">Teléfono</th>
              <th scope="col">Dirección</th>
              <th scope="col" className="text-center" style={{ minWidth: '180px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(clientes) && clientes.length > 0 ? (
              clientes.map((cliente) => (
                <tr key={cliente.idCliente}>
                  <td>{cliente.nombreCliente}</td>
                  <td>{cliente.apellidoCliente}</td>
                  <td>{cliente.cedulaCliente}</td>
                  <td>{cliente.usuario ? cliente.usuario.email : 'N/A'}</td>
                  <td>{cliente.telefonoCliente}</td>
                  <td>{cliente.direccion}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2 rounded-pill fw-semibold"
                      onClick={() => handleShowModal(cliente)}
                      disabled={isSaving}
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-pill fw-semibold"
                      onClick={() => confirmDelete(cliente.idCliente)}
                      disabled={isSaving}
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted fs-5">
                  No hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para editar cliente */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> {/* Tamaño grande */}
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-fill me-2"></i> Editar Cliente
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
                      <label htmlFor="nombreCliente" className="form-label fw-semibold">
                        <i className="bi bi-person-fill me-2"></i>Nombre
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-pill"
                        id="nombreCliente"
                        name="nombreCliente"
                        value={formData.nombreCliente}
                        onChange={handleChange}
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="apellidoCliente" className="form-label fw-semibold">
                        <i className="bi bi-person-fill me-2"></i>Apellido
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-pill"
                        id="apellidoCliente"
                        name="apellidoCliente"
                        value={formData.apellidoCliente}
                        onChange={handleChange}
                        required
                        disabled={isSaving}
                      />
                    </div>
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
                    <label htmlFor="telefonoCliente" className="form-label fw-semibold">
                      <i className="bi bi-telephone-fill me-2"></i>Teléfono
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      id="telefonoCliente"
                      name="telefonoCliente"
                      value={formData.telefonoCliente}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cedulaCliente" className="form-label fw-semibold">
                      <i className="bi bi-credit-card-fill me-2"></i>Cédula
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      id="cedulaCliente"
                      name="cedulaCliente"
                      value={formData.cedulaCliente}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="direccion" className="form-label fw-semibold">
                      <i className="bi bi-house-door-fill me-2"></i>Dirección
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <i className="bi bi-lock-fill me-2"></i>Nueva Contraseña (opcional)
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg rounded-pill"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
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
                  onClick={handleSaveCliente}
                  disabled={isSaving}
                >
                  <i className="bi bi-save-fill me-2"></i> {isSaving ? "Guardando..." : "Guardar"}
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
                <p className="fs-5 mb-4">¿Estás seguro de que deseas eliminar este cliente y su usuario asociado?</p>
                <p className="text-muted small">Esta acción es irreversible.</p>
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
