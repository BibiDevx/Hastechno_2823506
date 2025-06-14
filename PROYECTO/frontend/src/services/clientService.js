// src/services/clientService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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


const clientService = {
  updateProfile: async (userData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available");
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/clientes/actualizar/cuenta`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      // Asume que el backend devuelve { success: true, data: { ... } }
      if (response.data.success && response.data.data) {
          return response.data.data;
      }
      throw new Error("Formato de respuesta inesperado al actualizar el perfil.");
    } catch (error) {
      console.error("Error al actualizar el perfil del cliente:", error);
      throw new Error(getErrorMessage(error)); // Usar getErrorMessage
    }
  },

  deleteProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available");
    try {
      const response = await axios.delete(`${API_BASE_URL}/clientes/eliminar/cuenta`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // Asume que el backend devuelve { success: true, message: '...' }
      if (response.data.success) {
          return response.data;
      }
      throw new Error("Formato de respuesta inesperado al eliminar el perfil.");
    } catch (error) {
      console.error("Error al eliminar el perfil del cliente:", error);
      throw new Error(getErrorMessage(error)); // Usar getErrorMessage
    }
  },

  // Funciones para que los administradores gestionen clientes
  getAllClients: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available");
    try {
      const response = await axios.get(`${API_BASE_URL}/consumidores/clientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
          return response.data.data;
      }
      throw new Error("Formato de respuesta inesperado al obtener la lista de clientes.");
    } catch (error) {
      console.error("Error al obtener la lista de clientes:", error);
      throw new Error(getErrorMessage(error)); // Usar getErrorMessage
    }
  },

  getClientById: async (clientId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available");
    try {
      const response = await axios.get(`${API_BASE_URL}/consumidores/clientes/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.data.success && response.data.data) {
          return response.data.data;
      }
      throw new Error("Formato de respuesta inesperado al obtener el cliente por ID.");
    } catch (error) {
      console.error(`Error al obtener el cliente con ID ${clientId}:`, error);
      throw new Error(getErrorMessage(error)); // Usar getErrorMessage
    }
  },

  updateClient: async (clientId, clientData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available");
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/consumidores/clientes/actualizar/${clientId}`,
        clientData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.success && response.data.data) {
          return response.data.data;
      }
      throw new Error("Formato de respuesta inesperado al actualizar el cliente.");
    } catch (error) {
      console.error(`Error al actualizar el cliente con ID ${clientId}:`, error);
      throw new Error(getErrorMessage(error)); // Usar getErrorMessage
    }
  },

  deleteClient: async (clientId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available");
    try {
      const response = await axios.delete(`${API_BASE_URL}/consumidores/clientes/eliminar/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.data.success) {
          return response.data;
      }
      throw new Error("Formato de respuesta inesperado al eliminar el cliente.");
    } catch (error) {
      console.error(`Error al eliminar el cliente con ID ${clientId}:`, error);
      throw new Error(getErrorMessage(error)); // Usar getErrorMessage
    }
  },
};

export default clientService;
