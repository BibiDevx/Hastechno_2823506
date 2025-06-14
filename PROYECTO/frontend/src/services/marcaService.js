// src/services/marcaService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Función de ayuda para obtener el token
const getToken = () => {
  return localStorage.getItem('token');
};

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

const MarcaService = {

  async getAllMarcas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/verMarcas`); // Tu ruta pública
      // ✅ CORRECCIÓN CLAVE: Devolver response.data.data si está en un wrapper, o response.data si es el array directo
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) { // Fallback si el backend devuelve el array directamente
        return response.data;
      }
      throw new Error("Formato de respuesta inesperado al obtener todas las marcas.");
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // 2. Crear una nueva marca (POST /api/marcas/registrar) - Requiere autenticación
  async createMarca(marcaData) {
    const token = getToken();
    if (!token) throw new Error("No token available. Please log in.");
    try {
      const response = await axios.post(`${API_BASE_URL}/marcas/registrar`, marcaData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // ✅ CORRECCIÓN CLAVE: Devolver response.data.data si está en un wrapper, o response.data si es el objeto directo
      if (response.data.success && response.data.data) {
        
        return response.data.data;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      
        return response.data;
      }
      throw new Error("Formato de respuesta inesperado al crear la marca.");
    } catch (error) {
      console.error("Error al crear la marca:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // 3. Actualizar una marca existente (PATCH /api/marcas/actualizar/{id}) - Requiere autenticación
  async updateMarca(id, marcaData) {
    const token = getToken();
    if (!token) throw new Error("No token available. Please log in.");
    try {
      const response = await axios.patch(`${API_BASE_URL}/marcas/actualizar/${id}`, marcaData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // ✅ CORRECCIÓN CLAVE: Devolver response.data.data si está en un wrapper, o response.data si es el objeto directo
      if (response.data.success && response.data.data) {
        
        return response.data.data;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        
        return response.data;
      }
      throw new Error(`Formato de respuesta inesperado al actualizar la marca con ID ${id}.`);
    } catch (error) {
      console.error(`Error al actualizar la marca con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  // 4. Eliminar una marca (DELETE /api/marcas/eliminar/{id}) - Requiere autenticación
  async deleteMarca(id) {
    const token = getToken();
    if (!token) throw new Error("No token available. Please log in.");
    try {
      const response = await axios.delete(`${API_BASE_URL}/marcas/eliminar/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // ✅ CORRECCIÓN CLAVE: Devolver el objeto de respuesta completo si tiene 'success'
      if (response.data.success) {
        
        return response.data;
      }
      throw new Error(`Formato de respuesta inesperado al eliminar la marca con ID ${id}.`);
    } catch (error) {
      console.error(`Error al eliminar la marca con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  async getMarcaById(id) {
    const token = getToken();
    if (!token) throw new Error("No token available. Please log in.");
    try {
      const response = await axios.get(`${API_BASE_URL}/verMarcas/${id}`); // Tu ruta pública por ID
      // ✅ CORRECCIÓN CLAVE: Devolver response.data.data si está en un wrapper, o response.data si es el objeto directo
      if (response.data.success && response.data.data) {
       
        return response.data.data;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        
        return response.data;
      }
      throw new Error(`Formato de respuesta inesperado al obtener la marca con ID ${id}.`);
    } catch (error) {
      console.error(`Error al obtener la marca con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },
};

export default MarcaService;
