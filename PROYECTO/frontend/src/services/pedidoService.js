// src/services/pedidoService.js
import axios from 'axios';

// URL base de tu API de Laravel
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const pedidoService = {
  // Función para realizar un nuevo pedido
  placeOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token'); // ✅ Asegúrate que es 'token' y no 'authToken'
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        }
      };
      // ✅ CAMBIO AQUÍ: Añadir '/p' al final de API_BASE_URL si ya incluye /api
      // O cambiar la ruta completa si API_BASE_URL termina antes de /api
      // Suponiendo que API_BASE_URL es algo como http://localhost:8000/api
      const response = await axios.post(`${API_BASE_URL}/p/pedidos`, orderData, config); // ✅ CORREGIDO
      return response.data;
    } catch (error) {
      console.error('Error en pedidoService.placeOrder:', error.response?.data || error.message);
      throw error; 
    }
  },

  // Opcional: Función para obtener el historial de pedidos de un usuario
  getOrders: async () => {
    try {
      const token = localStorage.getItem('token'); // ✅ Asegúrate que es 'token' y no 'authToken'
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };
      const response = await axios.get(`${API_BASE_URL}/p/pedidos`, config); // ✅ CORREGIDO
      return response.data;
    } catch (error) {
      console.error('Error en pedidoService.getOrders:', error.response?.data || error.message);
      throw error;
    }
  },

  // Opcional: Función para obtener los detalles de un pedido específico
  getOrderById: async (idPedido) => {
    try {
      const token = localStorage.getItem('token'); // ✅ Asegúrate que es 'token' y no 'authToken'
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };
      const response = await axios.get(`${API_BASE_URL}/p/pedidos/${idPedido}`, config); // ✅ CORREGIDO
      return response.data;
    } catch (error) {
      console.error('Error en pedidoService.getPedidoById:', error.response?.data || error.message);
      throw error;
    }
  },
  getUserPurchaseItems: async () => {
    try {
      const response = await axios.get('/p/mis-productos-comprados'); // Llama a la nueva ruta
      return response.data; // Retorna la lista de ítems de PedidoProducto
    } catch (error) {
      console.error('Error al obtener los ítems de productos comprados:', error.response?.data || error.message);
      throw error;
    }
  },
  getAdminOrders: async () => {
   try {
      const token = localStorage.getItem('token'); // ✅ Asegúrate que es 'token' y no 'authToken'
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };
      const response = await axios.get(`${API_BASE_URL}/admin/pedidos`,config); 
      return response.data.data || response.data; // Ajusta si tu API envuelve los datos en 'data'
    } catch (error) {
      console.error('Error en pedidoService.getAdminOrders:', error.response?.data || error.message);
      throw error;
    }
  }
};


export default pedidoService;