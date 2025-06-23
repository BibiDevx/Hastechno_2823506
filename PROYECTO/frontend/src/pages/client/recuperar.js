// src/pages/RecuperarContrasena.js

import React, { useState } from "react";
import { Link } from "react-router-dom"; // Importa Link para navegación
import "bootstrap/dist/css/bootstrap.min.css";
  

// Simulación de un servicio de autenticación
// Deberás reemplazar esto con la llamada a tu API de Laravel real
const authService = {
  requestPasswordReset: async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "test@example.com") { // Simula un email registrado
          resolve({ message: "Se ha enviado un enlace de recuperación a tu correo electrónico." });
        } else if (email === "error@example.com") { // Simula un error
          reject({ message: "No se pudo procesar tu solicitud. Inténtalo de nuevo." });
        } else { // Simula un email no registrado
          reject({ message: "El correo electrónico no se encuentra registrado." });
        }
      }, 2000); // Simula un retraso de 2 segundos para la respuesta del servidor
    });
  },
};

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // Para mensajes de éxito/error
  const [messageType, setMessageType] = useState(null); // 'success' o 'danger'

  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    setLoading(true);
    setMessage(null); // Limpia mensajes anteriores
    setMessageType(null);

    try {
      // Llama a tu servicio de autenticación para solicitar el restablecimiento
      const response = await authService.requestPasswordReset(email);
      setMessage(response.message);
      setMessageType("success");
      setEmail(""); // Limpiar el campo de correo después del éxito

    } catch (error) {
      setMessage(error.message || "Error al solicitar la recuperación de contraseña.");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light p-3">
      <div className="card p-4 shadow-lg rounded-3" style={{ maxWidth: "28rem", width: "100%" }}> {/* Max-width y rounded-3 */}
        <h2 className="text-center mb-3 fw-bold text-primary">Recuperar Contraseña</h2> {/* fw-bold, text-primary */}
        <p className="text-center text-muted mb-4 small">
          Ingresa tu correo electrónico para recibir un enlace de recuperación.
        </p>

        {/* Mensajes de feedback para el usuario */}
        {message && (
          <div className={`alert alert-${messageType} text-center animated fadeIn mb-3`} role="alert">
            <i className={`bi ${messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              <i className="bi bi-envelope-fill me-2"></i>Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control form-control-lg rounded-pill" // form-control-lg, rounded-pill
              placeholder="tuemail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required // Hace el campo obligatorio
              disabled={loading} // Deshabilita mientras carga
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100 rounded-pill fw-bold" // btn-lg, rounded-pill, fw-bold
            disabled={loading || !email} // Deshabilita si está cargando o el email está vacío
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enviando...
              </>
            ) : (
              <>
                <i className="bi bi-send-fill me-2"></i> Enviar Enlace
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4"> {/* mt-4 para más espacio */}
          <Link to="/login" className="text-decoration-none text-secondary fw-semibold"> {/* text-secondary, fw-semibold */}
            <i className="bi bi-arrow-left-circle-fill me-2"></i>Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
