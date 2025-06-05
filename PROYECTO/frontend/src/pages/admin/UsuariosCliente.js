import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import clientService from "../../services/clientService"; // Asegúrate de que la ruta sea correcta

export default function UsuariosCliente() {
  const [showModal, setShowModal] = useState(false);
  // Eliminamos modalType ya que siempre es "editar" aquí

  const [formData, setFormData] = useState({
    // Campos del modelo Cliente
    idCliente: null, // Usamos idCliente como PK de la tabla 'cliente'
    nombreCliente: "",
    apellidoCliente: "",
    cedulaCliente: "",
    telefonoCliente: "",
    direccion: "",
    // Campos del modelo Usuario (relacionado)
    idUsuario: null, // El ID de la tabla 'usuario' asociada
    email: "",
    password: "", // Contraseña opcional para cambiar en edición
  });

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.getAllClients();
      if (response.success && Array.isArray(response.data)) {
        // Asume que la API devuelve clientes con la relación 'usuario' cargada
        setClientes(response.data);
      } else {
        setError("La API no devolvió una lista de clientes válida.");
        setClientes([]);
      }
    } catch (err) {
      console.error("Error al cargar los clientes:", err);
      setError("Error al cargar los clientes: " + (err.response?.data?.message || err.message || "Error desconocido."));
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
    setError(null);
    setFormData({
      idCliente: cliente.idCliente,
      nombreCliente: cliente.nombreCliente,
      apellidoCliente: cliente.apellidoCliente,
      cedulaCliente: cliente.cedulaCliente,
      telefonoCliente: cliente.telefonoCliente,
      direccion: cliente.direccion,
      // Cargamos el email desde el objeto 'usuario' anidado
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
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveCliente = async () => {
    // Validaciones de frontend (adaptadas a los nombres de tus modelos)
    if (
      !formData.nombreCliente.trim() ||
      !formData.apellidoCliente.trim() ||
      !formData.email.trim() ||
      !formData.telefonoCliente.trim() ||
      !formData.cedulaCliente.trim() ||
      !formData.direccion.trim()
    ) {
      setError("Todos los campos obligatorios deben ser completados.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    try {
      setLoading(true);
      // Se envían todos los datos del formulario, incluyendo los del usuario asociado
      // El backend debe ser capaz de discernir qué actualizar en `cliente` y qué en `usuario`.
      const dataToSend = { ...formData };
      delete dataToSend.idCliente; // No enviar el ID del cliente en el cuerpo al PATCH
      delete dataToSend.idUsuario; // No enviar el ID del usuario en el cuerpo al PATCH

      // Si la contraseña está vacía, no la enviamos para que el backend no la actualice.
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      // Enviar datos del cliente y del usuario asociado para actualización
      const response = await clientService.updateClient(formData.idCliente, dataToSend);

      if (response.success) {
        // Actualizar el estado con los datos devueltos por la API (que deben incluir el 'usuario' anidado)
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>
            cliente.idCliente === response.data.idCliente ? response.data : cliente
          )
        );
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar el cliente:", err);
      setError(err.response?.data?.message || 'Error al guardar el cliente. Por favor, intente de nuevo.');
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
        setError(error + ' ' + validationErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCliente = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente y su usuario asociado?")) {
      try {
        setLoading(true);
        // clientService.deleteClient ahora debe manejar la eliminación de ambas tablas en el backend
        await clientService.deleteClient(id);
        setClientes((prevClientes) => prevClientes.filter((cliente) => cliente.idCliente !== id));
        setError(null);
      } catch (err) {
        console.error("Error al eliminar el cliente:", err);
        setError(err.response?.data?.message || 'Error al eliminar el cliente.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !clientes.length && !error) {
    return <div className="container mt-4">Cargando clientes...</div>;
  }

  return (
    <div className="container mt-4">
      {error && !showModal && <div className="alert alert-danger mb-3">{error}</div>}

      <h2 className="mb-3">Clientes</h2>
      {/* El botón "Agregar Cliente" fue eliminado, asumiendo que se hace vía registro */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Cédula</th>
            <th>Correo</th> {/* Añadido Email aquí */}
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length > 0 ? (
            clientes.map((cliente) => (
              <tr key={cliente.idCliente}> {/* Usamos idCliente como key */}
                <td>{cliente.nombreCliente}</td>
                <td>{cliente.apellidoCliente}</td>
                <td>{cliente.cedulaCliente}</td>
                <td>{cliente.usuario ? cliente.usuario.email : 'N/A'}</td> {/* Muestra el email del usuario asociado */}
                <td>{cliente.telefonoCliente}</td>
                <td>{cliente.direccion}</td>
                <td>
                  <button className="btn btn-primary me-2" onClick={() => handleShowModal(cliente)}>
                    Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteCliente(cliente.idCliente)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No hay clientes registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de Cliente (solo para edición) */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Cliente</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input type="text" className="form-control" name="apellidoCliente" value={formData.apellidoCliente} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input type="text" className="form-control" name="telefonoCliente" value={formData.telefonoCliente} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nueva Contraseña (opcional)</label>
                    <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cédula</label>
                    <input type="text" className="form-control" name="cedulaCliente" value={formData.cedulaCliente} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dirección</label>
                    <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} required />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cerrar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveCliente} disabled={loading}>
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