// src/services/authService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_AUTH_URL = `${API_BASE_URL}/auth`; // Define la ruta base para la autenticación

// Función auxiliar para construir el mensaje de error más relevante
const getErrorMessage = (error) => {
  if (error.response?.data?.error) {
    if (typeof error.response.data.error === 'object') {
      return Object.values(error.response.data.error).flat().join(' ');
    }
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || "Error desconocido.";
};

const registerCliente = async (userData) => {
  try {
    const response = await axios.post(`${API_AUTH_URL}/register/cliente`, userData);
    return response.data;
  } catch (error) {
    console.error("Error al registrar cliente:", error);
    throw new Error(getErrorMessage(error));
  }
};

const registerAdmin = async (adminData) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token available");

  try {
    const response = await axios.post(`${API_AUTH_URL}/register/admin`, adminData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al registrar administrador:", error);
    throw new Error(getErrorMessage(error));
  }
};

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_AUTH_URL}/login`, {
      email,
      password,
    });

    const { access_token, user } = response.data.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));

    return { access_token, user };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw new Error(getErrorMessage(error));
  }
};

const logout = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return;
  }

  try {
    await axios.post(
      `${API_AUTH_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error al cerrar sesión en el backend:", error);
    localStorage.removeItem("token"); // Limpiar localmente incluso si el backend falla
    localStorage.removeItem("user");
    throw new Error(getErrorMessage(error));
  }
};

// ✅ FUNCIÓN getProfile AJUSTADA
const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token available");

  try {
    const response = await axios.get(`${API_AUTH_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // ✅ Nos aseguramos de que el backend devuelve un objeto con 'success' y 'data'.
    // Si no es así, el formato es incorrecto.
    if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Retorna DIRECTAMENTE el objeto de datos del perfil (ej. { email: '...', cliente: {...} })
    }
    // Si el formato no es el esperado (ej. falta 'data' o 'success' es false), lanzamos un error.
    throw new Error("Formato de respuesta de perfil inesperado de la API.");
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    throw new Error(getErrorMessage(error));
  }
};

//restablecer contraseña


const authService = {
  registerCliente,
  registerAdmin,
  login,
  logout,
  getProfile,
    requestPasswordReset: async (email) => {
    try {
      // Realiza la llamada POST a tu endpoint de Laravel
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      // Laravel debería devolver un mensaje de éxito
      return response.data;
    } catch (error) {
      // Si Laravel devuelve un error, lo capturamos
      const message = error.response?.data?.message || error.message || "Error desconocido al solicitar la recuperación.";
      throw new Error(message);
    }
  },

  // También necesitarás una función para el restablecimiento real:
   resetPassword: async (token, email, password, password_confirmation) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, { token, email, password, password_confirmation });
       return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Error al restablecer la contraseña.";
     throw new Error(message);
    }
   }
};

export default authService;
