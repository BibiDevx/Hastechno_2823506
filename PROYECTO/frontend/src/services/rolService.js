// src/services/rolService.js
import axios from 'axios';

// Asegúrate de que esta variable de entorno esté configurada en tu archivo .env.development o .env
// Por ejemplo: REACT_APP_API_BASE_URL=http://localhost:8000/api
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Función auxiliar para obtener el token de autenticación
const getToken = () => {
  return localStorage.getItem('token'); // Asume que el token se guarda en localStorage
};

const rolService = {
  /**
   * Obtiene todos los roles disponibles desde la API.
   * Endpoint de la API: GET /control/roles
   * Formato de respuesta esperado de la API: { success: true, roles: [{ idRol: 1, nombreRol: 'SuperAdmin' }, ...] }
   */
  getAllRoles: async () => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible. Por favor, inicia sesión.");
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/control/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Envía el token en las cabeceras
        },
      });

      // Validamos la respuesta de la API basándonos en el formato que nos proporcionaste (Postman)
      if (response.data.success && Array.isArray(response.data.roles)) {
        // Renombramos 'roles' a 'data' internamente para mantener consistencia con otros servicios
        return { success: response.data.success, data: response.data.roles, message: "Roles listados exitosamente." };
      } else {
        // Si el formato no es el esperado, lanzamos un error
        throw new Error("Formato de respuesta de roles no válido desde la API.");
      }
    } catch (error) {
      console.error("Error al obtener los roles:", error);
      // Propagamos el error para que sea manejado por el componente que llama
      // Intentamos obtener el mensaje de error del backend si está disponible
      throw error.response?.data?.message || error.message || "Fallo al obtener los roles.";
    }
  },

  // Puedes añadir más métodos aquí si necesitas interactuar con otras rutas de roles
  // como crear, actualizar o eliminar roles, basándote en tus rutas:
  // '/control/roles/registrar', '/control/roles/actualizar/{id}', etc.
};

export default rolService;