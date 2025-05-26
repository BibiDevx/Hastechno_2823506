import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Función auxiliar para obtener el token directamente
const getToken = () => {
  return localStorage.getItem('token'); // Asume que tu token se guarda directamente bajo la clave 'token'
};

const getProductCategories = (productId) => {
  const token = getToken();
  return axios.get(`${API_BASE_URL}/productos/${productId}/categorias`, {
    headers: {
      'Authorization': `Bearer ${token}`, // Incluye el token en el header de autorización
    },
  });
};

const syncProductCategories = (productId, categoryIds) => {
  const token = getToken();
  return axios.patch(`${API_BASE_URL}/productos/${productId}/categorias`, { categorias: categoryIds }, {
    headers: {
      'Authorization': `Bearer ${token}`, // Incluye el token en el header de autorización
    },
  });
};

const productCategoryService = {
  getProductCategories,
  syncProductCategories,
};

export default productCategoryService;