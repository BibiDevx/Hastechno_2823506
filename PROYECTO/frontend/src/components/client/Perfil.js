// src/pages/client/Perfil.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { clearLocalCart } from "../../redux/cartSlice";
import authServices from "../../services/authService";
import clientService from "../../services/clientService";
import "bootstrap/dist/css/bootstrap.min.css";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchClientProfile = async () => {
      setLoading(true);
      setError("");
      try {
        // ✅ authServices.getProfile() ahora nos devuelve directamente el objeto de usuario/perfil.
        const userProfileData = await authServices.getProfile();
        setUser(userProfileData); // ✅ Asignamos directamente el objeto recibido
        setError("");
      } catch (err) {
        console.error("Error al obtener el perfil:", err);
        setError(err.message || "No se pudo obtener el perfil del cliente.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [dispatch]);

  const handleEditClick = () => {
    navigate("/editar-perfil");
  };

  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar tu perfil? Esta acción no se puede deshacer y te desconectará de tu cuenta."
    );

    if (confirmDelete) {
      try {
        setLoading(true);
        await clientService.deleteProfile();
        
        dispatch(logout());
        dispatch(clearLocalCart());

        alert("Tu perfil ha sido eliminado exitosamente.");
        navigate("/login");
      } catch (err) {
        console.error("Error al eliminar el perfil:", err);
        alert(err.message || "Hubo un error al intentar eliminar el perfil.");
        setError(err.message || "Error al eliminar el perfil.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando perfil...</span>
        </div>
        <p className="mt-2 text-muted">Cargando información del perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <p className="alert alert-danger">{error}</p>
      </div>
    );
  }

  // ✅ La condición se mantiene, pero ahora 'user' debería ser un objeto directamente
  // si la llamada fue exitosa y la data existe.
  if (!user || !user.cliente) {
    return (
      <div className="container mt-5">
        <p className="text-muted">No se ha encontrado información del cliente o no estás logueado como cliente.</p>
        <p className="text-muted">Por favor, asegúrate de haber iniciado sesión con una cuenta de cliente.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0 rounded-lg">
        <div className="card-header bg-primary text-white fw-bold">
          <i className="bi bi-person-fill me-2"></i> Tu Perfil
        </div>
        <div className="card-body p-4">
          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <strong className="text-secondary">Email:</strong>
              <span>{user.email}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <strong className="text-secondary">Nombre:</strong>
              <span>{user.cliente.nombreCliente}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <strong className="text-secondary">Apellido:</strong>
              <span>{user.cliente.apellidoCliente}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <strong className="text-secondary">Documento:</strong>
              <span>{user.cliente.cedulaCliente}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <strong className="text-secondary">Dirección:</strong>
              <span>{user.cliente.direccion}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <strong className="text-secondary">Teléfono:</strong>
              <span>{user.cliente.telefonoCliente}</span>
            </li>
          </ul>

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-primary rounded-pill fw-semibold" onClick={handleEditClick}>
              <i className="bi bi-pencil-fill me-2"></i> Editar Perfil
            </button>
            <button 
              className="btn btn-danger rounded-pill fw-semibold" 
              onClick={handleDeleteClick}
              disabled={loading}
            >
              <i className="bi bi-trash-fill me-2"></i> {loading ? "Eliminando..." : "Eliminar Perfil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
