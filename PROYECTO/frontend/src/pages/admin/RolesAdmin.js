// src/components/RolesAdmin.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import rolService from "../../services/rolService"; // Importa el nuevo servicio de roles

export default function RolesAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "editar" o "agregar"

  const [formData, setFormData] = useState({
    idRol: null,
    nombreRol: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los roles
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rolService.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error("Error al cargar los roles:", err);
      setError(
        "Error al cargar los roles: " +
          (err.response?.data?.message || err.message || "Error desconocido.")
      );
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []);

  const handleShowModal = (type, rol = null) => {
    setModalType(type);
    if (rol) {
      setFormData({
        idRol: rol.idRol,
        nombreRol: rol.nombreRol,
      });
    } else {
      setFormData({
        idRol: null,
        nombreRol: "",
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      idRol: null,
      nombreRol: "",
    });
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveRol = async () => {
    // Validaciones de frontend
    if (!formData.nombreRol.trim()) {
      setError("El nombre del rol es obligatorio.");
      return;
    }

    try {
      setLoading(true);
      let response;

      if (modalType === "agregar") {
        response = await rolService.createRol(formData);
        setRoles((prevRoles) => [...prevRoles, response]);
      } else {
        // modalType === "editar"
        if (!formData.idRol) {
          setError("ID de rol no válido para editar.");
          setLoading(false);
          return;
        }
        response = await rolService.updateRol(formData.idRol, formData);
        setRoles((prevRoles) =>
          prevRoles.map((rol) =>
            rol.idRol === response.idRol ? response : rol
          )
        );
      }

      handleCloseModal();
      setError(null);
    } catch (err) {
      console.error("Error al guardar el rol:", err);
      let errorMessage =
        err.response?.data?.message ||
        "Error al guardar el rol. Por favor, intente de nuevo.";
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors)
          .flat()
          .join(" ");
        errorMessage += " " + validationErrors;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este rol? Si hay usuarios asociados, la eliminación fallará."
      )
    ) {
      try {
        setLoading(true);
        await rolService.deleteRol(id);
        setRoles((prevRoles) => prevRoles.filter((rol) => rol.idRol !== id));
        setError(null);
      } catch (err) {
        console.error("Error al eliminar el rol:", err);
        setError(
          err.response?.data?.message ||
            "Error al eliminar el rol. Podría tener usuarios asociados."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !roles.length && !error) {
    return <div className="container mt-4">Cargando roles...</div>;
  }

  if (error && !showModal && !loading) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Roles</h2>

      <button className="btn btn-success mb-3" onClick={() => handleShowModal("agregar")}>
        Agregar Rol
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.length > 0 ? (
            roles.map((rol) => (
              <tr key={rol.idRol}>
                <td>{rol.idRol}</td>
                <td>{rol.nombreRol}</td>
                <td>
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => handleShowModal("editar", rol)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(rol.idRol)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No se encontraron roles.
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
                  {modalType === "agregar" ? "Agregar Rol" : "Editar Rol"}
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
                    <label htmlFor="nombreRol" className="form-label">
                      Nombre del Rol
                    </label>
                    <input
                      type="text"
                      id="nombreRol"
                      className="form-control"
                      name="nombreRol"
                      value={formData.nombreRol}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
                  onClick={handleSaveRol}
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