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
      // Ruta actualizada a /control/roles
      const response = await axios.get(`${API_BASE_URL}/control/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Envía el token en las cabeceras
        },
      });

      // Tu rolController::index() devuelve response()->json(['success' => true, 'roles' => $roles])
      if (response.data.success && Array.isArray(response.data.roles)) {
        return response.data.roles; // Devolver directamente el array de roles
      } else {
        throw new Error("Formato de respuesta de roles no válido desde la API.");
      }
    } catch (error) {
      console.error("Error al obtener los roles:", error);
      // Propagamos el error para que sea manejado por el componente que llama
      // Intentamos obtener el mensaje de error del backend si está disponible
      throw error.response?.data?.error || error.message || "Fallo al obtener los roles.";
    }
  },

  /**
   * Obtiene un rol por su ID.
   * Endpoint de la API: GET /control/roles/{id}
   * Formato de respuesta esperado: { success: true, rol: { idRol: 1, nombreRol: 'SuperAdmin' } }
   */
  getRolById: async (idRol) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      // Ruta actualizada a /control/roles/{id}
      const response = await axios.get(`${API_BASE_URL}/control/roles/${idRol}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.rol) {
        return response.data.rol;
      }
      throw new Error("Formato de respuesta de rol individual no válido desde la API.");
    } catch (error) {
      console.error(`Error al obtener el rol con ID ${idRol}:`, error);
      throw error.response?.data?.error || error.message || `Fallo al obtener el rol con ID ${idRol}.`;
    }
  },

  /**
   * Crea un nuevo rol.
   * Endpoint de la API: POST /control/roles/registrar
   * Formato de respuesta esperado: { success: true, rol: { ... }, message: '...' }
   */
  createRol: async (rolData) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      // Ruta actualizada a /control/roles/registrar
      const response = await axios.post(`${API_BASE_URL}/control/roles/registrar`, rolData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.rol) {
        return response.data.rol;
      }
      throw new Error("Formato de respuesta de creación de rol no válido desde la API.");
    } catch (error) {
      console.error("Error al crear el rol:", error);
      throw error.response?.data?.error || error.message || "Fallo al crear el rol.";
    }
  },

  /**
   * Actualiza un rol existente.
   * Endpoint de la API: PATCH /control/roles/actualizar/{id}
   * Formato de respuesta esperado: { success: true, rol: { ... }, message: '...' }
   */
  updateRol: async (idRol, rolData) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      // Ruta actualizada a PATCH /control/roles/actualizar/{id}
      const response = await axios.patch(`${API_BASE_URL}/control/roles/actualizar/${idRol}`, rolData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.rol) {
        return response.data.rol;
      }
      throw new Error("Formato de respuesta de actualización de rol no válido desde la API.");
    } catch (error) {
      console.error(`Error al actualizar el rol con ID ${idRol}:`, error);
      throw error.response?.data?.error || error.message || `Fallo al actualizar el rol con ID ${idRol}.`;
    }
  },

  /**
   * Elimina un rol.
   * Endpoint de la API: DELETE /control/roles/eliminar/{id}
   * Formato de respuesta esperado: { success: true, message: '...' }
   */
  deleteRol: async (idRol) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      // Ruta actualizada a /control/roles/eliminar/{id}
      const response = await axios.delete(`${API_BASE_URL}/control/roles/eliminar/${idRol}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data; // Devuelve el objeto completo de éxito/mensaje
      }
      throw new Error("Formato de respuesta de eliminación de rol no válido desde la API.");
    } catch (error) {
      console.error(`Error al eliminar el rol con ID ${idRol}:`, error);
      throw error.response?.data?.error || error.message || `Fallo al eliminar el rol con ID ${idRol}.`;
    }
  },
};

export default rolService;
