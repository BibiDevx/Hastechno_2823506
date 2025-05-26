import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 

const getAllCategorias = () => {
  return axios.get(`${API_BASE_URL}/verCategorias`);
};

const categoriaService = {
  getAllCategorias,
};

export default categoriaService;