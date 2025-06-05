// src/services/marcaService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Función de ayuda para obtener el token
const getToken = () => {
  return localStorage.getItem('token');
};

const MarcaService = {

  async getAllMarcas() {
    try {

      const response = await axios.get(`${API_BASE_URL}/verMarcas`); // <-- Ajustado a tu ruta `/verMarcas` si existe
      return response.data;
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
      throw error;
    }
  },

  // 2. Crear una nueva marca (POST /api/marcas/registrar) - Requiere autenticación
  async createMarca(marcaData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/marcas/registrar`, marcaData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al crear la marca:", error);
      throw error;
    }
  },

  // 3. Actualizar una marca existente (PATCH /api/marcas/actualizar/{id}) - Requiere autenticación
  async updateMarca(id, marcaData) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/marcas/actualizar/${id}`, marcaData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar la marca:", error);
      throw error;
    }
  },

  // 4. Eliminar una marca (DELETE /api/marcas/eliminar/{id}) - Requiere autenticación
  async deleteMarca(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/marcas/eliminar/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al eliminar la marca:", error);
      throw error;
    }
  },


  async getMarcaById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/verMarcas/${id}`); // <-- Ajustado a tu ruta `/verMarcas/{id}` si existe
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la marca con ID ${id}:`, error);
      throw error;
    }
  },
};

export default MarcaService;