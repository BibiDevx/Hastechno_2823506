// src/services/categoriaService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

const categoriaService = {
  // 1. Obtener todas las categorías (ruta pública)
  async getAllCategorias() {
    try {
      const response = await axios.get(`${API_BASE_URL}/verCategorias`); 
      // ✅ CORRECCIÓN CLAVE: Acceder a response.data.data si existe, o a response.data si es el array directo
      if (response.data.success && Array.isArray(response.data.data)) {
        
        return response.data.data;
      }
      if (Array.isArray(response.data)) { // Fallback si el backend devuelve el array directamente
        
        return response.data;
      }
      throw new Error("Formato de respuesta inesperado al obtener todas las categorías.");
    } catch (error) {
      console.error("Error al obtener todas las categorías:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // 2. Crear una nueva categoría (ruta protegida)
  async createCategoria(categoriaData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/categorias/registrar`, categoriaData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      // ✅ CORRECCIÓN CLAVE: Acceder a response.data.data si existe, o a response.data si es el objeto directo
      if (response.data.success && response.data.data) {
        
        return response.data.data;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
       
        return response.data;
      }
      throw new Error("Formato de respuesta inesperado al crear la categoría.");
    } catch (error) {
      console.error("Error al crear la categoría:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // 3. Actualizar una categoría existente (ruta protegida, usando PATCH)
  async updateCategoria(id, categoriaData) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/categorias/actualizar/${id}`, categoriaData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      // ✅ CORRECCIÓN CLAVE: Acceder a response.data.data si existe, o a response.data si es el objeto directo
      if (response.data.success && response.data.data) {
        
        return response.data.data;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        
        return response.data;
      }
      throw new Error(`Formato de respuesta inesperado al actualizar la categoría con ID ${id}.`);
    } catch (error) {
      console.error(`Error al actualizar la categoría con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  // 4. Eliminar una categoría (ruta protegida)
  async deleteCategoria(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/categorias/eliminar/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      // ✅ CORRECCIÓN CLAVE: Devolver el objeto de respuesta completo si tiene 'success'
      if (response.data.success) {
        
        return response.data; 
      }
      throw new Error(`Formato de respuesta inesperado al eliminar la categoría con ID ${id}.`);
    } catch (error) {
      console.error(`Error al eliminar la categoría con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  // 5. Obtener una categoría por ID (ruta pública)
  async getCategoriaById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/verCategorias/${id}`); 
      // ✅ CORRECCIÓN CLAVE: Acceder a response.data.data si existe, o a response.data si es el objeto directo
      if (response.data.success && response.data.data) {
        
        return response.data.data;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        
        return response.data;
      }
      throw new Error(`Formato de respuesta inesperado al obtener la categoría con ID ${id}.`);
    } catch (error) {
      console.error(`Error al obtener la categoría con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },
};

export default categoriaService;
