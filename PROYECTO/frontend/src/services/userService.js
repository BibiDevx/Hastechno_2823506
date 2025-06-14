// src/services/userService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Función auxiliar para obtener el token de autenticación
const getToken = () => {
  return localStorage.getItem('token');
};

const userService = {
  /**
   * Obtiene todos los usuarios con su rol asociado.
   * Endpoint de la API: GET /usuarios-con-roles
   * Formato de respuesta esperado (de BaseController): { success: true, data: [{ idUsuario: 1, email: '...', rol: {...} }, ...] }
   */
  getAllUsersWithRoles: async () => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible. Por favor, inicia sesión.");
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/usuarios-con-roles`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      throw new Error('Formato de respuesta inesperado al obtener usuarios con roles.');
    } catch (error) {
      console.error('Error al obtener usuarios con roles:', error);
      throw error.response?.data?.message || error.message || "Fallo al obtener usuarios con roles.";
    }
  },

  /**
   * Actualiza el rol de un usuario específico.
   * Endpoint de la API: PATCH /usuarios/{idUsuario}/actualizar-rol
   * Formato de respuesta esperado (de BaseController): { success: true, data: { idUsuario: 1, email: '...', rol: {...} } }
   */
  updateUserRole: async (idUsuario, newRoleId) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      const response = await axios.patch(`${API_BASE_URL}/usuarios/${idUsuario}/actualizar-rol`, { idRol: newRoleId }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Formato de respuesta inesperado al actualizar el rol del usuario.');
    } catch (error) {
      console.error(`Error al actualizar el rol del usuario ${idUsuario}:`, error);
      throw error.response?.data?.message || error.message || `Fallo al actualizar el rol del usuario ${idUsuario}.`;
    }
  },

  /**
   * Elimina un usuario.
   * Endpoint de la API: DELETE /usuarios/{id}
   * Formato de respuesta esperado (de BaseController): { success: true, message: '...' }
   */
  deleteUser: async (idUsuario) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      const response = await axios.delete(`${API_BASE_URL}/usuarios/${idUsuario}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data; // Devuelve el objeto completo de éxito/mensaje
      }
      throw new Error("Formato de respuesta de eliminación de usuario no válido desde la API.");
    } catch (error) {
      console.error(`Error al eliminar el usuario con ID ${idUsuario}:`, error);
      throw error.response?.data?.message || error.message || `Fallo al eliminar el usuario con ID ${idUsuario}.`;
    }
  },

  /**
   * Obtiene un usuario por su ID.
   * Endpoint de la API: GET /usuarios/{id}
   * Formato de respuesta esperado (de BaseController): { success: true, data: { ... } }
   */
  getUserById: async (idUsuario) => {
    const token = getToken();
    if (!token) {
      throw new Error("No hay token disponible.");
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/usuarios/${idUsuario}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Formato de respuesta inesperado al obtener usuario por ID.');
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${idUsuario}:`, error);
      throw error.response?.data?.message || error.message || `Fallo al obtener usuario con ID ${idUsuario}.`;
    }
  },
};

export default userService;
