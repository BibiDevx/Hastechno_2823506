// src/services/authService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_AUTH_URL = `${API_BASE_URL}/auth`; // Define la ruta base para la autenticación

const registerCliente = async (userData) => {
  try {
    const response = await axios.post(`${API_AUTH_URL}/register/cliente`, userData);
    return response.data; // Puedes devolver los datos que el backend envíe al registrar
  } catch (error) {
    console.error("Error al registrar cliente:", error);
    throw error;
  }
};

const registerAdmin = async (adminData) => {
  const token = localStorage.getItem("token"); // Asumiendo que solo un SuperAdmin logueado puede registrar otro admin
  if (!token) throw new Error("No token available");

  try {
    const response = await axios.post(`${API_AUTH_URL}/register/admin`, adminData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Puedes devolver los datos que el backend envíe al registrar
  } catch (error) {
    console.error("Error al registrar administrador:", error);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_AUTH_URL}/login`, {
      email,
      password,
    });

    const { access_token, user } = response.data.data;

    // Guardamos el token y el usuario en localStorage
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));

    return { access_token, user };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error; // Re-lanza el error para que el componente lo maneje
  }
};

const logout = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

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

    // Eliminar datos de localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error; // Re-lanza el error
  }
};

// NOTA: La ruta para obtener el perfil SIGUE aquí en auth
const getProfile = async () => {
  try {
    const response = await axios.get(`${API_AUTH_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    throw error; // Re-lanza el error
  }
};

const authService = {
  registerCliente,
  registerAdmin,
  login,
  logout,
  getProfile,
};

export default authService;
