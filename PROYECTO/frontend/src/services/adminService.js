// src/services/adminService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getToken = () => {
  return localStorage.getItem('token');
};

const adminService = {
  /**
   * Obtiene todos los usuarios y los filtra para devolver solo los Administradores y SuperAdmins.
   * Endpoint de la API esperado: GET /users (según tu prefijo 'users')
   * Se espera que el backend cargue las relaciones 'rol' y 'admin' para cada usuario.
   * El frontend luego filtra estos usuarios para mostrar solo los que tienen el rol de administrador.
   */
  getAllAdmins: async () => {
    const token = getToken();
    if (!token) throw new Error("No hay token disponible. Por favor, inicia sesión.");

    try {
      // Endpoint de la API: GET /users
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Se asume que la estructura de tu API para /users es { success: true, data: [...] }
      const allUsers = response.data.data;
      if (!Array.isArray(allUsers)) {
        throw new Error("La API no devolvió una lista de usuarios válida.");
      }

      // Filtramos y mapeamos los usuarios para combinar datos de los modelos 'Usuario' y 'Admin'.
      // Solo incluimos usuarios con roles 'Admin' o 'SuperAdmin'.
      const filteredAdmins = allUsers
        .filter(user => user.rol && (user.rol.nombreRol === 'Admin' || user.rol.nombreRol === 'SuperAdmin'))
        .map(user => ({
          // Campos del modelo Admin (anidados bajo 'admin' en la respuesta de la API)
          idAdmin: user.admin ? user.admin.idAdmin : null,
          nombreAdmin: user.admin ? user.admin.nombreAdmin : null,
          apellidoAdmin: user.admin ? user.admin.apellidoAdmin : null,
          cedulaAdmin: user.admin ? user.admin.cedulaAdmin : null,
          telefonoAdmin: user.admin ? user.admin.telefonoAdmin : null,
          // Campos del modelo Usuario
          idUsuario: user.idUsuario, // Este es crucial para las operaciones PATCH/DELETE según tus rutas de API
          email: user.email,
          rol: user.rol, // El objeto completo del rol (idRol, nombreRol)
        }));

      return { success: true, data: filteredAdmins };

    } catch (error) {
      console.error("Error al obtener los administradores:", error);
      throw error.response?.data?.message || error.message || "Fallo al obtener los administradores.";
    }
  },

  /**
   * Crea un nuevo usuario Administrador/SuperAdmin.
   * Endpoint de la API esperado: POST /auth/register/admin
   * `adminAndUserData` debe contener campos combinados para los modelos Usuario y Admin (ej. nombreAdmin, apellidoAdmin, email, password, idRol).
   */
  createAdmin: async (adminAndUserData) => {
    const token = getToken();
    if (!token) throw new Error("No hay token disponible. Por favor, inicia sesión.");

    try {
      // Endpoint de la API: POST /auth/register/admin
      const response = await axios.post(`${API_BASE_URL}/auth/register/admin`, adminAndUserData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // Se espera: { success: true, data: { ...nuevoAdmin con usuario/rol }, message: "..." }
      return response.data;
    } catch (error) {
      console.error("Error al crear el administrador:", error);
      throw error.response?.data?.message || error.message || "Fallo al crear el administrador.";
    }
  },

  /**
   * Actualiza un usuario Administrador/SuperAdmin existente.
   * Endpoint de la API esperado: PATCH /users/admin/{idUsuario}
   * `userId` es el idUsuario (clave primaria de la tabla 'usuario') según tus rutas de API.
   * `adminAndUserData` contiene campos combinados (ej. nombreAdmin, apellidoAdmin, email, password, idRol).
   */
  updateAdmin: async (userId, adminAndUserData) => {
    const token = getToken();
    if (!token) throw new Error("No hay token disponible. Por favor, inicia sesión.");

    try {
      // Endpoint de la API: PATCH /users/admin/{idUsuario}
      const response = await axios.patch(
        `${API_BASE_URL}/userss/admin/${userId}`, // Usamos el idUsuario en la URL
        adminAndUserData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      // Se espera: { success: true, data: { ...adminActualizado con usuario/rol }, message: "..." }
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el administrador con ID de usuario ${userId}:`, error);
      throw error.response?.data?.message || error.message || "Fallo al actualizar el administrador.";
    }
  },

  /**
   * Elimina un usuario Administrador/SuperAdmin.
   * Endpoint de la API esperado: DELETE /users/admin/{idUsuario}
   * `userId` es el idUsuario (clave primaria de la tabla 'usuario') según tus rutas de API.
   */
  deleteAdmin: async (userId) => {
    const token = getToken();
    if (!token) throw new Error("No hay token disponible. Por favor, inicia sesión.");

    try {
      // Endpoint de la API: DELETE /users/admin/{idUsuario}
      const response = await axios.delete(`${API_BASE_URL}/userss/admin/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // Se espera: { success: true, message: "..." }
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el administrador con ID de usuario ${userId}:`, error);
      throw error.response?.data?.message || error.message || "Fallo al eliminar el administrador.";
    }
  },
};

export default adminService;