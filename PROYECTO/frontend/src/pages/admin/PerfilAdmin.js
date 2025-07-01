// src/pages/admin/PerfilAdmin.js

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'; // Importa axios (asume que está configurado con tu baseURL)

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ;

export default function PerfilAdmin() {
  const [adminProfile, setAdminProfile] = useState(null); // Este será el objeto 'User' completo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token'); // ✅ Asegúrate que es 'token' y no 'authToken'
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        };
        // Llama al endpoint /auth/profile
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, config); 
        // La respuesta.data.data contendrá el objeto 'User' con las relaciones cargadas
        setAdminProfile(response.data.data); 
      } catch (err) {
        console.error("Error al cargar el perfil del administrador:", err);
        setError(err.response?.data?.error || err.message || "Error al cargar la información del perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // --- Renderizado de estados de carga y error ---
  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando perfil...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando información del perfil del administrador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> Error: {error}
        </div>
        <button onClick={() => window.location.reload()} className="btn btn-outline-primary mt-3">
          <i className="bi bi-arrow-clockwise me-2"></i> Reintentar Carga
        </button>
      </div>
    );
  }

  // Si no se pudo cargar el perfil (y no hubo un error explícito)
  // O si el usuario no tiene la relación 'admin' cargada (no es un admin)
  if (!adminProfile || !adminProfile.admin) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-info-circle-fill me-2"></i> No se pudo obtener la información de perfil de administrador o no tienes los permisos adecuados.
        </div>
        <button onClick={() => window.location.reload()} className="btn btn-outline-primary mt-3">
          <i className="bi bi-arrow-clockwise me-2"></i> Reintentar
        </button>
      </div>
    );
  }

  // Accede a los datos del administrador a través de la relación 'admin'
  const { admin, email } = adminProfile; // Desestructura el objeto adminProfile (que es el User)

  return (
    <div className="container mt-5 mb-5 p-3"> {/* ✅ Contenedor principal ajustado */}
      <h1 className="text-center mb-4 fw-bold text-primary">
        <i className="bi bi-person-circle me-3"></i>Perfil del Administrador
      </h1>

      <div className="bg-white p-4 shadow-sm rounded-3"> {/* ✅ Nuevo contenedor para el formulario, con fondo blanco y sombra */}
        <form>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="nombre" className="form-label fw-semibold">
                <i className="bi bi-person-fill me-2"></i>Nombre
              </label>
              <input
                type="text"
                className="form-control form-control-lg rounded-pill"
                id="nombre"
                value={admin.nombreAdmin || ''}
                readOnly
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="apellido" className="form-label fw-semibold">
                <i className="bi bi-person-fill me-2"></i>Apellido
              </label>
              <input
                type="text"
                className="form-control form-control-lg rounded-pill"
                id="apellido"
                value={admin.apellidoAdmin || ''}
                readOnly
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="correo" className="form-label fw-semibold">
              <i className="bi bi-envelope-fill me-2"></i>Correo electrónico
            </label>
            <input
              type="email"
              className="form-control form-control-lg rounded-pill"
              id="correo"
              value={email || ''}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label htmlFor="telefono" className="form-label fw-semibold">
              <i className="bi bi-telephone-fill me-2"></i>Teléfono
            </label>
            <input
              type="tel"
              className="form-control form-control-lg rounded-pill"
              id="telefono"
              value={admin.telefonoAdmin || ''}
              readOnly
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="cedula" className="form-label fw-semibold">
              <i className="bi bi-credit-card-fill me-2"></i>Cédula
            </label>
            <input
              type="text"
              className="form-control form-control-lg rounded-pill"
              id="cedula"
              value={admin.cedulaAdmin || ''}
              readOnly
            />
          </div>

        </form>

        <div className="text-center mt-4">
          <p className="text-muted small">
            Para cualquier cambio en la información, contacta al soporte técnico.
          </p>
        </div>
      </div> {/* Fin del nuevo contenedor del formulario */}

      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
