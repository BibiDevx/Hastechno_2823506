// src/components/ProveedoresAdmin.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import proveedorService from "../../services/proveedorService"; 

export default function ProveedoresAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "editar" o "agregar"

  // Estado para los datos del formulario de proveedor
  const [formData, setFormData] = useState({
    idProveedor: null,
    nombreProveedor: "",
    emailProveedor: "", 
    telefonoProveedor: "",
  });

  // Estado para la lista de proveedores
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para la carga inicial de la tabla
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para indicar si se está guardando
  const [error, setError] = useState(null);

  // Función para cargar los proveedores desde el backend
  const fetchProveedores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proveedorService.getAllProveedores(); 
      setProveedores(data);
    } catch (err) {
      console.error("Error al cargar los proveedores:", err);
      setError(
        "Error al cargar los proveedores: " + (err.message || "Error desconocido.")
      );
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los proveedores al montar el componente
  useEffect(() => {
    fetchProveedores();
  }, []);

  // Manejador para mostrar el modal (agregar o editar)
  const handleShowModal = (type, proveedor = null) => {
    setModalType(type);
    if (proveedor) {
      setFormData({
        idProveedor: proveedor.idProveedor,
        nombreProveedor: proveedor.nombreProveedor,
        emailProveedor: proveedor.emailProveedor, 
        telefonoProveedor: proveedor.telefonoProveedor,
      });
    } else {
      setFormData({
        idProveedor: null,
        nombreProveedor: "",
        emailProveedor: "", 
        telefonoProveedor: "",
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
      idProveedor: null,
      nombreProveedor: "",
      emailProveedor: "", 
      telefonoProveedor: "",
    });
    setError(null);
  };

  // Manejador para cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador para guardar un proveedor (crear o actualizar)
  const handleSaveProveedor = async () => {
    // Validaciones de frontend
    if (
      !formData.nombreProveedor.trim() ||
      !formData.emailProveedor.trim() || 
      !formData.telefonoProveedor.trim()
    ) {
      setError("Todos los campos obligatorios deben ser completados.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailProveedor)) { 
      setError("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    setIsSaving(true); // Activar estado de guardado
    setError(null); // Limpiar errores antes de intentar guardar

    try {
      let response;
      const dataToSend = { ...formData }; // Los datos ya están correctamente mapeados

      if (modalType === "agregar") {
        response = await proveedorService.createProveedor(dataToSend);
        setProveedores((prevProveedores) => [...prevProveedores, response]); 
        alert("Proveedor agregado correctamente.");
      } else {
        if (!formData.idProveedor) {
          setError("ID de proveedor no válido para editar.");
          setIsSaving(false); // Desactivar si hay un error
          return;
        }
        response = await proveedorService.updateProveedor(formData.idProveedor, dataToSend);
        setProveedores((prevProveedores) =>
          prevProveedores.map((proveedor) =>
            proveedor.idProveedor === response.idProveedor ? response : proveedor
          )
        );
        alert("Proveedor actualizado correctamente.");
      }

      handleCloseModal(); // Cierra el modal al guardar con éxito
    } catch (err) {
      console.error("Error al guardar el proveedor:", err);
      // El getErrorMessage en el servicio ya maneja la prioridad de mensajes
      setError(err.message || "Error desconocido al guardar el proveedor.");
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
      setLoading(false); // Ocultar carga (asegurarse de que se resetea)
    }
  };

  // Manejador para eliminar un proveedor
  const handleDeleteProveedor = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este proveedor? Esta acción es irreversible."
      )
    ) {
      setLoading(true); // Mostrar carga mientras se elimina
      setError(null); // Limpiar errores previos
      try {
        const response = await proveedorService.deleteProveedor(id); 
        if (response.success) {
            setProveedores((prevProveedores) => prevProveedores.filter((proveedor) => proveedor.idProveedor !== id));
            setError(null);
            alert("Proveedor eliminado correctamente.");
        } else {
            throw new Error(response.message || "Fallo al eliminar el proveedor.");
        }
      } catch (err) {
        console.error("Error al eliminar el proveedor:", err);
        setError(err.message || "Error al eliminar el proveedor.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Renderizado condicional para el estado de carga inicial
  if (loading && !proveedores.length && !error) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando proveedores...</span>
        </div>
        <p className="mt-2 text-muted">Cargando lista de proveedores...</p>
      </div>
    );
  }

  // Renderizado condicional para el error global (no del modal)
  if (error && !showModal && !loading) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Proveedores</h2>

     
      <button 
        className="btn btn-success mb-3" 
        onClick={() => handleShowModal("agregar")} // Llama a handleShowModal con el tipo "agregar"
      >
        <i className="bi bi-plus-circle-fill me-2"></i> Agregar Proveedor
      </button>

      <div className="table-responsive"> 
        <table className="table table-bordered table-hover shadow-sm"> 
          <thead className="table-dark"> 
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(proveedores) && proveedores.length > 0 ? (
              proveedores.map((proveedor) => (
                <tr key={proveedor.idProveedor}>
                  <td>{proveedor.idProveedor}</td>
                  <td>{proveedor.nombreProveedor}</td>
                  <td>{proveedor.emailProveedor}</td> 
                  <td>{proveedor.telefonoProveedor}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleShowModal("editar", proveedor)}
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteProveedor(proveedor.idProveedor)}
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted"> 
                  No se encontraron proveedores.
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
                  {modalType === "agregar" ? "Agregar Proveedor" : "Editar Proveedor"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-3">
                    <label htmlFor="nombreProveedor" className="form-label">
                      Nombre del Proveedor
                    </label>
                    <input
                      type="text"
                      id="nombreProveedor"
                      className="form-control"
                      name="nombreProveedor"
                      value={formData.nombreProveedor}
                      onChange={handleChange}
                      required
                      disabled={isSaving} // Deshabilitar durante el guardado
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="emailProveedor" className="form-label"> 
                      Correo del Proveedor
                    </label>
                    <input
                      type="email"
                      id="emailProveedor" 
                      className="form-control"
                      name="emailProveedor" 
                      value={formData.emailProveedor} 
                      onChange={handleChange}
                      required
                      disabled={isSaving} // Deshabilitar durante el guardado
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="telefonoProveedor" className="form-label">
                      Teléfono del Proveedor
                    </label>
                    <input
                      type="text"
                      id="telefonoProveedor"
                      className="form-control"
                      name="telefonoProveedor"
                      value={formData.telefonoProveedor}
                      onChange={handleChange}
                      required
                      disabled={isSaving} // Deshabilitar durante el guardado
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
                  onClick={handleSaveProveedor}
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
