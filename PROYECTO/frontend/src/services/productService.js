// src/services/productService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const productService = {
  // Rutas sin autenticación (prefijo 'verProductos')
  getAllAvailableProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verProductos`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener la lista de productos disponibles:", error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verProductos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el producto con ID ${id}:`, error);
      throw error;
    }
  },

  getHomeProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verProductos/home`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener productos para la página de inicio:", error);
      throw error;
    }
  },

  getProductsByBrand: async (brandId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verProductos/marcas/${brandId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener productos de la marca con ID ${brandId}:`, error);
      throw error;
    }
  },

  // Rutas con autenticación y rol de Admin (prefijo 'productos')
  getAllProductsWithDetailsForAdmin: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/detalles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener detalles de productos para el admin:", error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/productos/registrar`, productData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al registrar el producto:", error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/productos/actualizar/${id}`, productData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el producto con ID ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/productos/eliminar/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el producto con ID ${id}:`, error);
      throw error;
    }
  },
};

export default productService;