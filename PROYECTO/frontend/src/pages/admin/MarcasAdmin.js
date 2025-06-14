import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import marcaService from "../../services/marcaService"; // Import the brand service

export default function MarcasAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedMarca, setSelectedMarca] = useState(null);
  const [marcas, setMarcas] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [nombreMarca, setNombreMarca] = useState(''); 
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para el guardado

  // Fetch brands on component mount
  useEffect(() => {
    const fetchMarcas = async () => {
      setLoading(true);
      setError(null); 
      try {
        // ✅ CORRECCIÓN CLAVE: marcaService.getAllMarcas() ahora devuelve directamente el array de marcas
        const fetchedMarcas = await marcaService.getAllMarcas();
        
        if (Array.isArray(fetchedMarcas)) {
          setMarcas(fetchedMarcas);
          setError(null); 
        } else {
          console.error("La API no devolvió una lista de marcas válida. Datos recibidos:", fetchedMarcas);
          setError("La API no devolvió una lista de marcas válida.");
          setMarcas([]); 
        }
      } catch (err) {
        console.error("Error al cargar las marcas:", err);
        setError("Error al cargar las marcas: " + (err.message || "Error desconocido."));
        setMarcas([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchMarcas();
  }, []);

  const handleShowModal = (type, marca = null) => {
    setModalType(type);
    setSelectedMarca(marca);
    // ✅ CORRECCIÓN CLAVE: Usamos 'nombreMarca' de la marca, no 'nombre'
    setNombreMarca(marca ? marca.nombreMarca : ''); 
    setShowModal(true);
    setError(null); 
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMarca(null);
    setNombreMarca(''); 
    setError(null); 
  };

  const handleSaveMarca = async () => {
    if (!nombreMarca.trim()) {
      setError("El nombre de la marca no puede estar vacío.");
      return;
    }

    setIsSaving(true); // Activar estado de guardado
    setError(null); // Limpiar errores antes de guardar

    try {
      let responseData;
      const marcaData = { nombreMarca: nombreMarca.trim() }; // Asume que el backend espera 'nombreMarca'

      if (modalType === "agregar") {
        // ✅ CORRECCIÓN: createMarca() devuelve directamente el objeto de la nueva marca
        responseData = await marcaService.createMarca(marcaData);
        setMarcas((prevMarcas) => [...prevMarcas, responseData]); 
      } else { // modalType === "editar"
        if (!selectedMarca || !selectedMarca.idMarca) { 
          setError("ID de marca no válido para editar.");
          setIsSaving(false);
          return;
        }
        // ✅ CORRECCIÓN: updateMarca() devuelve directamente el objeto de la marca actualizada
        responseData = await marcaService.updateMarca(selectedMarca.idMarca, marcaData);
        setMarcas((prevMarcas) =>
          prevMarcas.map((marca) =>
            marca.idMarca === responseData.idMarca ? responseData : marca 
          )
        );
      }
      handleCloseModal(); 
      alert(`Marca ${modalType === 'agregar' ? 'agregada' : 'actualizada'} correctamente.`);
    } catch (err) {
      console.error("Error al guardar la marca:", err);
      setError(err.message || 'Error al guardar la marca. Por favor, intente de nuevo.');
    } finally {
      setIsSaving(false); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta marca?")) {
      setLoading(true); // Mostrar carga mientras se elimina
      setError(null); // Limpiar errores previos
      try {
        // ✅ marcaService.deleteMarca() devuelve un objeto con { success: true, message: '...' }
        // No necesitamos la respuesta de este servicio para actualizar el estado,
        // solo esperamos que no lance un error.
        await marcaService.deleteMarca(id);
        setMarcas(marcas.filter((marca) => marca.idMarca !== id)); 
        alert("Marca eliminada correctamente.");
      } catch (err) {
        console.error("Error al eliminar la marca:", err);
        setError(err.message || 'Error al eliminar la marca.');
      } finally {
        setLoading(false); 
      }
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando marcas...</span>
        </div>
        <p className="mt-2 text-muted">Cargando lista de marcas...</p>
      </div>
    );
  }

  if (error && !showModal) { 
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Marcas</h2>
      <button className="btn btn-success mb-3" onClick={() => handleShowModal("agregar")}>
        <i className="bi bi-plus-circle-fill me-2"></i> Agregar Marca
      </button>
      
      <table className="table table-bordered table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(marcas) && marcas.length > 0 ? (
            marcas.map((marca) => (
              <tr key={marca.idMarca}> 
                <td>{marca.idMarca}</td> 
                <td>{marca.nombreMarca}</td> 
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleShowModal("editar", marca)}
                  >
                    <i className="bi bi-pencil-fill me-1"></i> Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(marca.idMarca)}
                  >
                    <i className="bi bi-trash-fill me-1"></i> Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                No se encontraron marcas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal para agregar/editar marca */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {modalType === "agregar" ? "Agregar Marca" : "Editar Marca"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => e.preventDefault()}> 
                  <div className="mb-3">
                    <label htmlFor="nombreMarca" className="form-label">Nombre de la Marca</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombreMarca"
                      value={nombreMarca} 
                      onChange={(e) => setNombreMarca(e.target.value)}
                      required 
                      disabled={isSaving} // Deshabilitar durante el guardado
                    />
                  </div>
                </form>
                {error && <div className="alert alert-danger mt-3">{error}</div>} 
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={isSaving} 
                >
                  <i className="bi bi-x-circle-fill me-2"></i> Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveMarca}
                  disabled={isSaving} 
                >
                  <i className="bi bi-save-fill me-2"></i> {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
