// src/services/rolService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getToken = () => {
  return localStorage.getItem('token');
};

const rolService = {
  getAllRoles: async () => {
    const token = getToken();
    if (!token) throw new Error("No hay token disponible. Por favor, inicia sesión.");

    try {
      const response = await axios.get(`${API_BASE_URL}/control/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // --- ¡CAMBIO AQUÍ! ---
      // Ahora verificamos si 'response.data.success' es true Y si 'response.data.roles' es un array.
      if (response.data.success && Array.isArray(response.data.roles)) {
        // Devolvemos el objeto con 'success' y 'data' (renombrando 'roles' a 'data' para consistencia interna)
        return { success: response.data.success, data: response.data.roles, message: response.data.message || "Roles listados exitosamente." };
      }
      // Si por alguna razón la API no devuelve 'success' pero sí un array directamente (aunque tu Postman muestra 'success: true'),
      // esta segunda condición ya no es necesaria con tu respuesta actual, pero la mantengo como fallback si la API cambiara.
      else if (Array.isArray(response.data)) {
        return { success: true, data: response.data, message: "Roles listados exitosamente." };
      }
      // Si no coincide con ninguno de los formatos esperados, lanzamos el error.
      else {
        throw new Error("Formato de respuesta de roles no válido desde la API.");
      }
    } catch (error) {
      console.error("Error al obtener los roles:", error);
      throw error.response?.data?.message || error.message || "Fallo al obtener los roles.";
    }
  },
};

export default rolService;