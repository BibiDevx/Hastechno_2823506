// src/pages/RegistroCliente.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importa Link y useNavigate
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RegistroCliente = () => {
  const navigate = useNavigate(); // Hook para la navegación

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    identificacion: "",
    email: "",
    direccion: "",
    telefono: "",
    password: "",
    confirmarPassword: "",
  });

  const [message, setMessage] = useState(null); // Para mensajes de éxito/error
  const [messageType, setMessageType] = useState(null); // 'success' o 'danger'
  const [loading, setLoading] = useState(false); // Estado de carga del botón

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Lógica para permitir solo números en identificación y teléfono
    if (name === "identificacion" || name === "telefono") {
      // Filtra cualquier caracter que no sea un dígito
      newValue = value.replace(/\D/g, ''); 
    } 
    // ✅ Lógica para no aceptar números en nombres y apellidos
    else if (name === "nombres" || name === "apellidos") {
      // Filtra cualquier caracter que no sea una letra (incluyendo acentos y ñ), espacio o guion
      newValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    setForm({
      ...form,
      [name]: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage(null); // Limpiar mensajes anteriores
    setMessageType(null); // Limpiar tipo de mensaje anterior
    setLoading(true); // Activar estado de carga

    if (form.password !== form.confirmarPassword) {
      setMessage("Las contraseñas no coinciden.");
      setMessageType("danger");
      setLoading(false);
      return;
    }

    // ✅ Validación adicional en frontend para nombres y apellidos (aunque ya se filtren en handleChange)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombres)) {
      setMessage("El nombre solo puede contener letras, espacios y guiones.");
      setMessageType("danger");
      setLoading(false);
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.apellidos)) {
      setMessage("El apellido solo puede contener letras, espacios y guiones.");
      setMessageType("danger");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/cliente`, {
        nombreCliente: form.nombres,
        apellidoCliente: form.apellidos,
        cedulaCliente: form.identificacion,
        telefonoCliente: form.telefono,
        direccion: form.direccion,
        email: form.email,
        password: form.password,
        c_password: form.confirmarPassword, // Laravel espera 'password_confirmation' o 'c_password'
      });

      // Si la API devuelve un campo 'success' o similar en el cuerpo de la respuesta
      if (response.data.success) { 
        setMessage("¡Registro exitoso! Ya puedes iniciar sesión.");
        setMessageType("success"); // Aseguramos que sea 'success' aquí
        // Limpiar el formulario después de un registro exitoso
        setForm({
          nombres: "",
          apellidos: "",
          identificacion: "",
          email: "",
          direccion: "",
          telefono: "",
          password: "",
          confirmarPassword: "",
        });
        // Opcional: Redirigir al usuario a la página de login después de un tiempo
        setTimeout(() => {
          navigate("/login"); 
        }, 2000); // Reducido a 2 segundos para una mejor UX
      } else {
        // En caso de que la API devuelva success: false pero sin un error en el catch
        setMessage(response.data.message || "Error al registrar el cliente.");
        setMessageType("danger");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      // Manejo de errores más específico de Axios/Laravel
      if (error.response) {
        // Errores de validación de Laravel (ej. 422 Unprocessable Entity)
        if (error.response.status === 422 && error.response.data.errors) {
          let errorMessages = [];
          for (let key in error.response.data.errors) {
            errorMessages = errorMessages.concat(error.response.data.errors[key]);
          }
          setMessage(errorMessages.join(" ")); // Une todos los mensajes de error
        } else {
          setMessage(error.response.data.message || "Error del servidor al registrar.");
        }
        setMessageType("danger");
      } else if (error.request) {
        setMessage("No se pudo conectar con el servidor. Verifica tu conexión.");
        setMessageType("danger");
      } else {
        setMessage("Ocurrió un error inesperado. Intenta de nuevo.");
        setMessageType("danger");
      }
    } finally {
      setLoading(false); // Desactivar estado de carga
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light p-3"> {/* Centrado vertical y horizontal, padding */}
      <style>
        {`
        .animated.fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
      <div className="card shadow-lg p-4 rounded-3" style={{ maxWidth: "600px", width: "100%" }}> {/* Sombra, redondeado, ancho responsivo */}
        <h2 className="text-center mb-4 fw-bold text-primary">
          <i className="bi bi-person-plus-fill me-3"></i>Registro de Nuevo Cliente
        </h2>

        {/* Mensajes de feedback dinámicos */}
        {message && (
          <div className={`alert alert-${messageType} text-center animated fadeIn mb-4`} role="alert">
            <i className={`bi ${messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3"> {/* Usar grid de Bootstrap para campos lado a lado */}
            <div className="col-md-6">
              <label htmlFor="nombres" className="form-label fw-semibold">
                <i className="bi bi-person-fill me-2"></i>Nombres
              </label>
              <input
                type="text"
                id="nombres"
                className="form-control form-control-lg rounded-pill"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                required
                disabled={loading}
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]*" // ✅ Permite letras, espacios y guiones
                title="Solo se permiten letras, espacios y guiones."
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="apellidos" className="form-label fw-semibold">
                <i className="bi bi-person-fill me-2"></i>Apellidos
              </label>
              <input
                type="text"
                id="apellidos"
                className="form-control form-control-lg rounded-pill"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                required
                disabled={loading}
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]*" // ✅ Permite letras, espacios y guiones
                title="Solo se permiten letras, espacios y guiones."
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="identificacion" className="form-label fw-semibold">
              <i className="bi bi-credit-card-fill me-2"></i>Número de Identificación
            </label>
            <input
              type="text" // Mantenemos 'text' para flexibilidad (ej. ceros a la izquierda)
              id="identificacion"
              className="form-control form-control-lg rounded-pill"
              name="identificacion"
              value={form.identificacion}
              onChange={handleChange} // Aquí se aplica la lógica de filtrado
              required
              inputMode="numeric" // Sugiere teclado numérico en móviles
              pattern="[0-9]*" // Validación básica en HTML5 para solo dígitos
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              <i className="bi bi-envelope-fill me-2"></i>Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control form-control-lg rounded-pill"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="direccion" className="form-label fw-semibold">
              <i className="bi bi-house-door-fill me-2"></i>Dirección
            </label>
            <input
              type="text"
              id="direccion"
              className="form-control form-control-lg rounded-pill"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="telefono" className="form-label fw-semibold">
              <i className="bi bi-telephone-fill me-2"></i>Teléfono
            </label>
            <input
              type="tel" // Semánticamente correcto para teléfono
              id="telefono"
              className="form-control form-control-lg rounded-pill"
              name="telefono"
              value={form.telefono}
              onChange={handleChange} // Aquí se aplica la lógica de filtrado
              inputMode="numeric" // Sugiere teclado numérico en móviles
              pattern="[0-9]*" // Validación básica en HTML5 para solo dígitos
              disabled={loading}
            />
          </div>

          <div className="row g-3 mb-4"> {/* Contraseñas en una fila */}
            <div className="col-md-6">
              <label htmlFor="password" className="form-label fw-semibold">
                <i className="bi bi-lock-fill me-2"></i>Contraseña
              </label>
              <input
                type="password"
                id="password"
                className="form-control form-control-lg rounded-pill"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength="6" 
                disabled={loading}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="confirmarPassword" className="form-label fw-semibold">
                <i className="bi bi-lock-fill me-2"></i>Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmarPassword"
                className="form-control form-control-lg rounded-pill"
                name="confirmarPassword"
                value={form.confirmarPassword}
                onChange={handleChange}
                required
                minLength="6"
                disabled={loading}
              />
            </div>
          </div>

          <div className="d-grid gap-2">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg rounded-pill fw-bold" 
              disabled={loading} 
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registrando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i> Registrar
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-decoration-none text-secondary fw-semibold">
            <i className="bi bi-arrow-left-circle-fill me-2"></i>¿Ya tienes una cuenta? Inicia Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistroCliente;
