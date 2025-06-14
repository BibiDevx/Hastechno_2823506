// src/services/carritoService.js
import axios from 'axios';
import { getOrCreateGuestId } from '../utils/guestCartUtils'; // Importar utilidad

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getToken = () => {
  return localStorage.getItem('token');
};

const getCommonHeaders = () => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Si no hay token, envía el guest_id para el carrito de invitado
    headers['X-Guest-ID'] = getOrCreateGuestId();
  }
  return headers;
};

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

const carritoService = {
  getCart: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/carrito`, {
        headers: getCommonHeaders(),
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      throw new Error("Formato de respuesta inesperado al obtener el carrito.");
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  addToCart: async (itemData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/carrito`, itemData, {
        headers: getCommonHeaders(),
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error("Formato de respuesta inesperado al añadir al carrito.");
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  updateCartItem: async (idCarrito, newQuantityData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/carrito/${idCarrito}`, newQuantityData, {
        headers: getCommonHeaders(),
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      if (response.data.success && response.data.message) {
        return { idCarrito: idCarrito, removed: true, message: response.data.message };
      }
      throw new Error("Formato de respuesta inesperado al actualizar el carrito.");
    } catch (error) {
      console.error(`Error al actualizar ítem ${idCarrito} del carrito:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  removeCartItem: async (idCarrito) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/carrito/${idCarrito}`, {
        headers: getCommonHeaders(),
      });
      if (response.data.success) {
        return response.data.message;
      }
      throw new Error("Formato de respuesta inesperado al eliminar del carrito.");
    } catch (error) {
      console.error(`Error al eliminar ítem ${idCarrito} del carrito:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  clearCart: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/carrito/vaciar`, {}, {
        headers: getCommonHeaders(),
      });
      if (response.data.success) {
        return response.data.message;
      }
      throw new Error("Formato de respuesta inesperado al vaciar el carrito.");
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  // NUEVO MÉTODO para fusionar el carrito de invitado con el del usuario logueado
  mergeGuestCart: async (guestId) => {
    const token = getToken();
    if (!token) {
      throw new Error("Autenticación requerida para fusionar el carrito.");
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/carrito/fusionar`, { guest_id: guestId }, {
        headers: { 'Authorization': `Bearer ${token}` }, // Envía el token del usuario logueado
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data; // Retorna el carrito del usuario logueado después de la fusión
      }
      throw new Error("Formato de respuesta inesperado al fusionar el carrito.");
    } catch (error) {
      console.error('Error al fusionar el carrito:', error);
      throw new Error(getErrorMessage(error));
    }
  },
};

export default carritoService;
