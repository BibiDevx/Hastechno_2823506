// src/services/productCategoryService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getToken = () => {
  return localStorage.getItem('token');
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

const productCategoryService = {
  getProductCategories: async (productId) => {
    const token = getToken();
    if (!token) throw new Error("No token available. Please log in.");
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/${productId}/categorias`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) { 
        return response.data;
      }
      console.error("Unexpected product categories response format from API. Response:", response.data);
      throw new Error("Unexpected product categories response format from API.");
    } catch (error) {
      console.error(`Error fetching categories for product ${productId}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },
      
  syncProductCategories: async (productId, categoryIds) => {
    const token = getToken();
    if (!token) throw new Error("No token available. Please log in.");
    try {
      // Usamos POST ahora que la ruta del backend es POST
      const response = await axios.patch(`${API_BASE_URL}/productos/${productId}/categorias`, { categorias: categoryIds }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data; // Devuelve el objeto completo de éxito/mensaje
      }
      throw new Error("Unexpected product categories sync response format.");
    } catch (error) {
      console.error(`Error syncing categories for product ${productId}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },
};

export default productCategoryService;
    