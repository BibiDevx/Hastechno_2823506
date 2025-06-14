// src/components/UsuariosCliente.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import clientService from "../../services/clientService"; 

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
  const [loading, setLoading] = useState(true); // Para la carga inicial y operaciones
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para indicar si se está guardando
  const [error, setError] = useState(null);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ CORRECCIÓN CLAVE AQUÍ: clientService.getAllClients() devuelve directamente el array de clientes
      const clientesData = await clientService.getAllClients(); 
      
      // Ahora, solo verificamos si lo que recibimos es realmente un array
      if (Array.isArray(clientesData)) {
        // Asume que la API devuelve clientes con la relación 'usuario' cargada
        setClientes(clientesData);
      } else {
        console.error("La API no devolvió una lista de clientes válida (no es un array).");
        setError("La API no devolvió una lista de clientes válida.");
        setClientes([]);
      }
    } catch (err) {
      console.error("Error al cargar los clientes:", err);
      // El mensaje de error ya viene formateado desde clientService
      setError("Error al cargar los clientes: " + (err.message || "Error desconocido."));
      setClientes([]); // Limpiar clientes en caso de error
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

    setIsSaving(true); // Activar estado de guardado
    setError(null); // Limpiar errores antes de intentar guardar

    try {
      // Se envían todos los datos del formulario, incluyendo los del usuario asociado
      const dataToSend = { ...formData };
      // No enviar los IDs en el cuerpo al PATCH, ya que van en la URL o se gestionan internamente
      delete dataToSend.idCliente; 
      delete dataToSend.idUsuario; 

      // Si la contraseña está vacía, no la enviamos para que el backend no la actualice.
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      // ✅ CORRECCIÓN CLAVE AQUÍ: clientService.updateClient devuelve directamente el objeto cliente actualizado
      const updatedCliente = await clientService.updateClient(formData.idCliente, dataToSend);

      // Actualizar el estado con los datos devueltos por la API (que deben incluir el 'usuario' anidado)
      // Aseguramos que updatedCliente es un objeto válido antes de mapear
      if (updatedCliente && updatedCliente.idCliente) {
          setClientes((prevClientes) =>
            prevClientes.map((cliente) =>
              cliente.idCliente === updatedCliente.idCliente ? updatedCliente : cliente
            )
          );
          handleCloseModal();
          setError(null);
          alert("Cliente actualizado correctamente.");
      } else {
          throw new Error("No se pudo actualizar el cliente. Respuesta de la API inválida.");
      }
    } catch (err) {
      console.error("Error al guardar el cliente:", err);
      // El mensaje de error ya viene formateado desde clientService
      setError(err.message || 'Error al guardar el cliente. Por favor, intente de nuevo.');
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
    }
  };

  const handleDeleteCliente = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente y su usuario asociado? Esta acción es irreversible.")) {
      setIsSaving(true); // Activar estado de guardado (para operaciones de eliminación también)
      setError(null); // Limpiar errores previos
      try {
        // clientService.deleteClient devuelve un objeto { success: true, message: '...' }
        const response = await clientService.deleteClient(id);
        
        // Verificamos la propiedad 'success' en la respuesta
        if (response.success) {
          setClientes((prevClientes) => prevClientes.filter((cliente) => cliente.idCliente !== id));
          setError(null);
          alert("Cliente eliminado correctamente.");
        } else {
          // Si el backend indicó un fallo pero no lanzó un error HTTP
          throw new Error(response.message || "Fallo al eliminar el cliente.");
        }
      } catch (err) {
        console.error("Error al eliminar el cliente:", err);
        // El mensaje de error ya viene formateado desde clientService
        setError(err.message || 'Error al eliminar el cliente.');
      } finally {
        setIsSaving(false); // Desactivar estado de guardado
      }
    }
  };

  // Renderizado condicional para el estado de carga inicial
  if (loading && !clientes.length && !error) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando clientes...</span>
        </div>
        <p className="mt-2 text-muted">Cargando lista de clientes...</p>
      </div>
    );
  }
  
  // Mostrar error si la carga ha terminado y hay un error global (no del modal)
  if (error && !showModal && !loading) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Administrar Clientes</h2>
      
      
      <div className="table-responsive"> 
        <table className="table table-bordered table-hover shadow-sm"> 
          <thead className="table-dark"> 
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cédula</th>
              <th>Correo</th> 
              <th>Teléfono</th>
              <th>Dirección</th>
              <th className="text-center">Acciones</th>
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
                      className="btn btn-primary btn-sm me-2" 
                      onClick={() => handleShowModal(cliente)}
                      disabled={isSaving} // Deshabilitar mientras se guarda/elimina otro
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDeleteCliente(cliente.idCliente)}
                      disabled={isSaving} // Deshabilitar mientras se guarda/elimina otro
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted"> 
                  No hay clientes registrados.
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
                <h5 className="modal-title">Editar Cliente</h5>
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
                    <label htmlFor="nombreCliente" className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="nombreCliente"
                      name="nombreCliente" 
                      value={formData.nombreCliente} 
                      onChange={handleChange} 
                      required 
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="apellidoCliente" className="form-label">Apellido</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="apellidoCliente"
                      name="apellidoCliente" 
                      value={formData.apellidoCliente} 
                      onChange={handleChange} 
                      required 
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email"
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="telefonoCliente" className="form-label">Teléfono</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="telefonoCliente"
                      name="telefonoCliente" 
                      value={formData.telefonoCliente} 
                      onChange={handleChange} 
                      required 
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Nueva Contraseña (opcional)</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="password"
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cedulaCliente" className="form-label">Cédula</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="cedulaCliente"
                      name="cedulaCliente" 
                      value={formData.cedulaCliente} 
                      onChange={handleChange} 
                      required 
                      disabled={isSaving}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="direccion" className="form-label">Dirección</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="direccion"
                      name="direccion" 
                      value={formData.direccion} 
                      onChange={handleChange} 
                      required 
                      disabled={isSaving}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
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
