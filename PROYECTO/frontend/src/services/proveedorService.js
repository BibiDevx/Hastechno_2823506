// src/services/proveedorService.js
import axios from 'axios';

// Asegúrate de que esta variable de entorno esté configurada en tu archivo .env.development o .env
// Por ejemplo: REACT_APP_API_BASE_URL=http://localhost:8000/api
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Función auxiliar para obtener el token de autenticación
const getToken = () => {
  return localStorage.getItem('token'); // Asume que el token se guarda en localStorage
};

// Función auxiliar para construir el mensaje de error más relevante
const getErrorMessage = (error) => {
  // Prioridad 1: error.response.data.error (para validaciones específicas de Laravel)
  if (error.response?.data?.error) {
    if (typeof error.response.data.error === 'object') {
      // Si 'error' es un objeto (ej. errores de validación de Laravel), unimos los mensajes
      return Object.values(error.response.data.error).flat().join(' ');
    }
    // Si 'error' es un string directo
    return error.response.data.error;
  }
  // Prioridad 2: error.response.data.message (para mensajes de error generales de BaseController)
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  // Prioridad 3: Mensaje de error general de Axios o del navegador
  return error.message || "Error desconocido.";
};

const proveedorService = {
  /**
   * Obtiene todos los proveedores.
   * Endpoint de la API: GET /proveedores/verProveedores
   * Formato de respuesta esperado (de BaseController): { success: true, data: [{...}, ...], message: '...' }
   */
  getAllProveedores: async () => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible. Por favor, inicia sesión.");
    }
    try {
      // Ruta actualizada para incluir el prefijo 'proveedores'
      const response = await axios.get(`${API_BASE_URL}/proveedores/verProveedores`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      throw new Error('Formato de respuesta inesperado al obtener proveedores.');
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Crea un nuevo proveedor.
   * Endpoint de la API: POST /proveedores/registrar
   * Formato de respuesta esperado (de BaseController): { success: true, data: {...}, message: '...' }
   */
  createProveedor: async (proveedorData) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      // Ruta actualizada para incluir el prefijo 'proveedores'
      const response = await axios.post(`${API_BASE_URL}/proveedores/registrar`, proveedorData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Formato de respuesta inesperado al crear proveedor.');
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Obtiene un proveedor por su ID.
   * Endpoint de la API: GET /proveedores/proveedores/{id}
   * Formato de respuesta esperado (de BaseController): { success: true, data: {...}, message: '...' }
   */
  getProveedorById: async (id) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      // Ruta actualizada para incluir el prefijo 'proveedores' antes de 'proveedores/{id}'
      const response = await axios.get(`${API_BASE_URL}/proveedores/proveedores/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Formato de respuesta inesperado al obtener proveedor por ID.');
    } catch (error) {
      console.error(`Error al obtener proveedor con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Actualiza un proveedor parcialmente.
   * Endpoint de la API: PATCH /proveedores/actualizar/{id}
   * Formato de respuesta esperado (de BaseController): { success: true, data: {...}, message: '...' }
   */
  updateProveedor: async (id, proveedorData) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      // Ruta actualizada para incluir el prefijo 'proveedores'
      const response = await axios.patch(`${API_BASE_URL}/proveedores/actualizar/${id}`, proveedorData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Formato de respuesta inesperado al actualizar proveedor.');
    } catch (error) {
      console.error(`Error al actualizar proveedor con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Elimina un proveedor.
   * Endpoint de la API: DELETE /proveedores/eliminar/{id}
   * Formato de respuesta esperado (de BaseController): { success: true, data: [], message: '...' }
   */
  deleteProveedor: async (id) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      // Ruta actualizada para incluir el prefijo 'proveedores'
      const response = await axios.delete(`${API_BASE_URL}/proveedores/eliminar/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data; // Devuelve el objeto completo de éxito/mensaje
      }
      throw new Error("Formato de respuesta de eliminación de proveedor no válido.");
    } catch (error) {
      console.error(`Error al eliminar proveedor con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },
};

export default proveedorService;
