import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import categoriaService from "../../services/categoriaService"; // Importa tu servicio de categorías

export default function CategoriasAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  // `nombreCategoria` para el input del modal
  const [nombreCategoria, setNombreCategoria] = useState("");
  // `selectedCategory` para guardar la categoría completa si estamos editando
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorias, setCategorias] = useState([]); // Ahora se cargará de la API
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado para errores

  // Efecto para cargar las categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await categoriaService.getAllCategorias();
        if (response.success && Array.isArray(response.data)) {
          setCategorias(response.data);
          setError(null); // Limpiar errores previos
        } else {
          // Si la API no devuelve el formato esperado o el array
          setError("La API no devolvió una lista de categorías válida.");
          setCategorias([]);
        }
      } catch (err) {
        console.error("Error al cargar las categorías:", err);
        setError("Error al cargar las categorías. " + (err.response?.data?.message || err.message));
        setCategorias([]); // Limpiar categorías en caso de error
      } finally {
        setLoading(false); // Finalizar carga
      }
    };

    fetchCategorias();
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez al montar

  const handleShowModal = (type, category = null) => {
    setModalType(type);
    setSelectedCategory(category);
    // Establece el valor del input del modal:
    // Si estamos editando, usa el nombre de la categoría seleccionada, si no, cadena vacía.
    setNombreCategoria(category ? category.nombreCategoria : ""); // Asegúrate de que tu API devuelve 'nombreCategoria'
    setShowModal(true);
    setError(null); // Limpiar errores del modal al abrirlo
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setNombreCategoria(""); // Limpiar input al cerrar
    setError(null); // Limpiar errores al cerrar
  };

  const handleSaveCategory = async () => {
    if (!nombreCategoria.trim()) {
      setError("El nombre de la categoría no puede estar vacío.");
      return;
    }

    try {
      setLoading(true); // Mostrar carga mientras se guarda
      let response;
      const categoriaData = { nombreCategoria: nombreCategoria.trim() }; // Asume que el backend espera 'nombreCategoria'

      if (modalType === "agregar") {
        response = await categoriaService.createCategoria(categoriaData);
        // Agregar la nueva categoría al estado de React
        setCategorias((prevCategorias) => [...prevCategorias, response.data]);
      } else { // modalType === "editar"
        if (!selectedCategory || !selectedCategory.idCategoria) {
            setError("ID de categoría no válido para editar.");
            setLoading(false);
            return;
        }
        response = await categoriaService.updateCategoria(selectedCategory.idCategoria, categoriaData);
        // Actualizar la categoría en el estado de React
        setCategorias((prevCategorias) =>
          prevCategorias.map((cat) =>
            cat.idCategoria === response.data.idCategoria ? response.data : cat // Asegúrate de usar 'idCategoria'
          )
        );
      }
      handleCloseModal(); // Cerrar modal al guardar con éxito
      setError(null); // Limpiar errores si el guardado fue exitoso
    } catch (err) {
      console.error("Error al guardar la categoría:", err);
      setError(err.response?.data?.message || 'Error al guardar la categoría.');
    } finally {
      setLoading(false); // Ocultar carga
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      try {
        setLoading(true); // Mostrar carga mientras se elimina
        await categoriaService.deleteCategoria(id);
        // Filtrar la categoría eliminada del estado de React
        setCategorias((prevCategorias) => prevCategorias.filter((cat) => cat.idCategoria !== id));
        setError(null); // Limpiar errores previos
      } catch (err) {
        console.error("Error al eliminar la categoría:", err);
        setError(err.response?.data?.message || 'Error al eliminar la categoría.');
      } finally {
        setLoading(false); // Ocultar carga
      }
    }
  };

  if (loading) {
    return <div className="container mt-4">Cargando categorías...</div>;
  }

  if (error && !showModal) { // Muestra el error general si no estamos en el modal
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Categorías</h2>

      <button className="btn btn-success mb-3" onClick={() => handleShowModal("agregar")}>
        Agregar Categoría
      </button>

      {error && showModal && ( // Muestra el error dentro del modal si es relevante
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
          {categorias.length > 0 ? (
            categorias.map((categoria) => (
              <tr key={categoria.idCategoria}> {/* Asegúrate de usar idCategoria */}
                <td>{categoria.idCategoria}</td> {/* Asegúrate de usar idCategoria */}
                <td>{categoria.nombreCategoria}</td> {/* Asegúrate de usar nombreCategoria */}
                <td>
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => handleShowModal("editar", categoria)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(categoria.idCategoria)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No se encontraron categorías.
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
                  {modalType === "agregar" ? "Agregar Categoría" : "Editar Categoría"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => e.preventDefault()}> {/* Prevenir el envío por defecto */}
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre de la Categoría</label>
                        <input
                            type="text"
                            id="nombre"
                            className="form-control"
                            value={nombreCategoria} // Controlado por el estado `nombreCategoria`
                            onChange={(e) => setNombreCategoria(e.target.value)}
                            required
                        />
                    </div>
                </form>
                {error && <div className="alert alert-danger mt-3">{error}</div>} {/* Muestra el error dentro del modal */}
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
                  onClick={handleSaveCategory}
                  disabled={loading} // Deshabilitar mientras se guarda
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