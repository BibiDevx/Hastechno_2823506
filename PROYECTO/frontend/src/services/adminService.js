// src/services/adminService.js
import axios from 'axios';

// La URL base de tu API, tomada de las variables de entorno de React.
// Asegúrate de que REACT_APP_API_BASE_URL esté definido en tu .env de React
// (ej. REACT_APP_API_BASE_URL=http://localhost:8000/api)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const adminService = {
  // 1. **Registrar un nuevo administrador (Ruta protegida por SuperAdmin)**
  // Corresponde a POST /api/auth/register/admin
  registerAdmin: async (adminData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available. User must be logged in as SuperAdmin to register an admin.");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register/admin`,
        adminData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al registrar nuevo administrador:", error);
      throw error;
    }
  },

  // 2. **Obtener todos los administradores (por SuperAdmin)**
  // Corresponde a GET /api/users/show
  getAllAdmins: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available. User must be logged in as SuperAdmin.");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/show`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data; // Esperamos { success: true, data: [...] }
    } catch (error) {
      console.error("Error al obtener todos los administradores:", error);
      throw error;
    }
  },

  // 3. **Obtener un administrador por ID (por SuperAdmin)**
  // Corresponde a GET /api/users/ver/admin/{id}
  getAdminById: async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available. User must be logged in as SuperAdmin.");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/ver/admin/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el administrador con ID ${id}:`, error);
      throw error;
    }
  },

  // 4. **Actualizar un administrador (usado por SuperAdmin para editar a otros admins)**
  // Corresponde a PATCH /api/users/actualizar/admin/{id}
  updateAdmin: async (idAdmin, adminData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available. User must be logged in as SuperAdmin.");
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/users/actualizar/admin/${idAdmin}`,
        adminData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el administrador con ID ${idAdmin}:`, error);
      throw error;
    }
  },

  // 5. **Eliminar un administrador (por SuperAdmin)**
  // Corresponde a DELETE /api/users/delete/admin/{id}
  deleteAdmin: async (idAdmin) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available. User must be logged in as SuperAdmin.");
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/users/delete/admin/${idAdmin}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el administrador con ID ${idAdmin}:`, error);
      throw error;
    }
  },

  // 6. **Actualizar el perfil de UN administrador (el que está autenticado)**
  // Esta ruta NO estaba en tu listado inicial de API para SuperAdmin,
  // pero es común para que un usuario (admin en este caso) actualice SU PROPIO perfil.
  // Si esta funcionalidad existe, tu backend debería tener una ruta como:
  // Route::middleware('auth:api')->patch('/auth/profile/update', [AuthController::class, 'updateProfile']);
  // AJUSTA LA URL (`/auth/profile/update`) si tu ruta de Laravel es diferente.
  updateMyAdminProfile: async (adminData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token available. User must be logged in.");
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/auth/profile/update`, // <-- **AJUSTA ESTA RUTA** si es diferente en tu Laravel
        adminData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el perfil del administrador:", error);
      throw error;
    }
  }
};

export default adminService;