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

  // Fetch brands on component mount
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await marcaService.getAllMarcas();
        if (response.success && Array.isArray(response.data)) {
          setMarcas(response.data);
          setError(null); 
        } else {
          setError("La API no devolvió una lista de marcas.");
          setMarcas([]); 
        }
      } catch (err) {
        console.error("Error al cargar las marcas:", err);
        setError("Error al cargar las marcas. " + (err.response?.data?.message || err.message));
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
    setNombreMarca(marca ? marca.nombre : ''); 
    setShowModal(true);
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

    try {
      setLoading(true); 
      let response;
      if (modalType === "agregar") {
        response = await marcaService.createMarca({ nombreMarca: nombreMarca.trim() });
        setMarcas((prevMarcas) => [...prevMarcas, response.data]); 
      } else { 
        if (!selectedMarca || !selectedMarca.idMarca) { 
          setError("ID de marca no válido para editar.");
          setLoading(false);
          return;
        }
        response = await marcaService.updateMarca(selectedMarca.idMarca, { nombreMarca: nombreMarca.trim() });
        setMarcas((prevMarcas) =>
          prevMarcas.map((marca) =>
            marca.idMarca === response.data.idMarca ? response.data : marca 
          )
        );
      }
      handleCloseModal(); 
      setError(null); 
    } catch (err) {
      console.error("Error al guardar la marca:", err);
      setError(err.response?.data?.message || 'Error al guardar la marca.');
    } finally {
      setLoading(false); // Hide loading
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta marca?")) {
      try {
        setLoading(true); 
        await marcaService.deleteMarca(id);
        setMarcas(marcas.filter((marca) => marca.idMarca !== id)); 
        setError(null); 
      } catch (err) {
        console.error("Error al eliminar la marca:", err);
        setError(err.response?.data?.message || 'Error al eliminar la marca.');
      } finally {
        setLoading(false); 
      }
    }
  };

  if (loading) {
    return <div className="container mt-4">Cargando marcas...</div>;
  }

  if (error && !showModal) { 
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Marcas</h2>
      <button className="btn btn-success mb-3" onClick={() => handleShowModal("agregar")}>
        Agregar Marca
      </button>
      {error && showModal && ( 
        <div className="alert alert-danger mt-3">{error}</div>
      )}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {marcas.length > 0 ? (
            marcas.map((marca) => (
              <tr key={marca.idMarca}> 
                <td>{marca.idMarca}</td> 
                <td>{marca.nombreMarca}</td> 
                <td>
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => handleShowModal("editar", marca)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(marca.idMarca)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No se encontraron marcas.
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
                  {modalType === "agregar" ? "Agregar Marca" : "Editar Marca"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => e.preventDefault()}> 
                  <div className="mb-3">
                    <label htmlFor="nombreMarca" className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombreMarca"
                      value={nombreMarca} 
                      onChange={(e) => setNombreMarca(e.target.value)}
                      required // Mark as required
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
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveMarca}
                  disabled={loading} 
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}