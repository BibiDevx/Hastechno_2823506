// src/services/productService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getToken = () => localStorage.getItem('token');

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

const productService = {
  getAllAvailableProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verProductos`);
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn("Unexpected product list format from API for public access. Returning empty array.", response.data);
      return [];
    } catch (error) {
      console.error("Error al obtener la lista de productos disponibles:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verProductos/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data; 
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data;
      }
      console.error(`Unexpected product detail format for ID ${id}. Response:`, response.data);
      throw new Error(`Unexpected product detail format for ID ${id}.`);
    } catch (error) {
      console.error(`Error al obtener el producto con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  getHomeProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verProductos/home`);
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn("Unexpected home products list format. Returning empty array.", response.data);
      return [];
    } catch (error) {
      console.error("Error al obtener productos para la página de inicio:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  getProductsByBrand: async (brandId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verProductos/marcas/${brandId}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn(`Unexpected product list by brand format for ID ${brandId}. Returning empty array.`, response.data);
      return [];
    } catch (error) {
      console.error(`Error al obtener productos de la marca con ID ${brandId}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  getAllProductsWithDetailsForAdmin: async () => {
    const token = getToken();
    if (!token) throw new Error("No token available.");
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/detalles`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn("Unexpected product details list format for admin. Returning empty array.", response.data);
      return [];
    } catch (error) {
      console.error("Error al obtener detalles de productos para el admin:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  createProduct: async (productData) => {
    const token = getToken();
    if (!token) throw new Error("No token available.");
    try {
      const response = await axios.post(`${API_BASE_URL}/productos/registrar`, productData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data;
      }
      throw new Error("Unexpected product creation response format.");
    } catch (error) {
      console.error("Error al registrar el producto:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  updateProduct: async (id, productData) => {
    const token = getToken();
    if (!token) throw new Error("No token available.");
    try {
      const response = await axios.patch(`${API_BASE_URL}/productos/actualizar/${id}`, productData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data;
      }
      throw new Error("Unexpected product update response format.");
    } catch (error) {
      console.error(`Error al actualizar el producto con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  deleteProduct: async (id) => {
    const token = getToken();
    if (!token) throw new Error("No token available.");
    try {
      const response = await axios.delete(`${API_BASE_URL}/productos/eliminar/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data;
      }
      throw new Error("Unexpected product deletion response format.");
    } catch (error) {
      console.error(`Error al eliminar el producto con ID ${id}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  getProductCategories: async (productId) => {
    const token = getToken();
    if (!token) throw new Error("No token available.");
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/${productId}/categorias`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn(`Unexpected product categories response format for product ${productId}. Returning empty array.`, response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching categories for product ${productId}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  syncProductCategories: async (productId, categoryIds) => {
    const token = getToken();
    if (!token) throw new Error("No token available.");
    try {
      const response = await axios.post(`${API_BASE_URL}/productos/${productId}/categorias/sync`, { categorias: categoryIds }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data.message;
      }
      throw new Error("Unexpected product categories sync response format.");
    } catch (error) {
      console.error(`Error syncing categories for product ${productId}:`, error);
      throw new Error(getErrorMessage(error));
    }
  },

  // ✅ NUEVO MÉTODO: Obtener productos con stock bajo para el dashboard
  getLowStockProducts: async () => {
    const token = getToken();
    if (!token) throw new Error("No token available."); 
    try {
      // Esta es la ruta que tu backend debería implementar para devolver productos con stock bajo
      const response = await axios.get(`${API_BASE_URL}/productos/productos-bajo-stock`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn("Unexpected low stock products list format. Returning empty array.", response.data);
      return [];
    } catch (error) {
      console.error("Error al obtener productos con stock bajo:", error);
      throw new Error(getErrorMessage(error));
    }
  },
};

export default productService;
