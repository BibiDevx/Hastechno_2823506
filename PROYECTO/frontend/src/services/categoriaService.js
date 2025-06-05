// src/services/categoriaService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getToken = () => {
  return localStorage.getItem('token'); // Asegúrate de que el token se guarde aquí
};

const categoriaService = {
  // 1. Obtener todas las categorías (ruta pública)
  async getAllCategorias() {
    try {
      const response = await axios.get(`${API_BASE_URL}/verCategorias`); // <-- ¡Esta es la ruta correcta!
      return response.data; // Debería devolver { success: true, data: [...categorias...], message: "..." }
    } catch (error) {
      console.error("Error al obtener todas las categorías:", error);
      throw error;
    }
  },

  // 2. Crear una nueva categoría (ruta protegida)
  async createCategoria(categoriaData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/categorias/registrar`, categoriaData, { // <-- ¡Esta es la ruta correcta!
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data; // Debería devolver { success: true, data: { ...nuevaCategoria... }, message: "..." }
    } catch (error) {
      console.error("Error al crear la categoría:", error);
      throw error;
    }
  },

  // 3. Actualizar una categoría existente (ruta protegida, usando PATCH)
  async updateCategoria(id, categoriaData) {
    try {
      // Usamos axios.patch porque tu ruta es PATCH
      const response = await axios.patch(`${API_BASE_URL}/categorias/actualizar/${id}`, categoriaData, { // <-- ¡Esta es la ruta correcta!
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data; // Debería devolver { success: true, data: { ...categoriaActualizada... }, message: "..." }
    } catch (error) {
      console.error(`Error al actualizar la categoría con ID ${id}:`, error);
      throw error;
    }
  },

  // 4. Eliminar una categoría (ruta protegida)
  async deleteCategoria(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/categorias/eliminar/${id}`, { // <-- ¡Esta es la ruta correcta!
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      return response.data; // Debería devolver { success: true, message: "..." }
    } catch (error) {
      console.error(`Error al eliminar la categoría con ID ${id}:`, error);
      throw error;
    }
  },

  // 5. Obtener una categoría por ID (ruta pública)
  async getCategoriaById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/verCategorias/${id}`); // <-- ¡Esta es la ruta correcta!
      return response.data; // Debería devolver { success: true, data: { ...categoria... }, message: "..." }
    } catch (error) {
      console.error(`Error al obtener la categoría con ID ${id}:`, error);
      throw error;
    }
  },
};

export default categoriaService;