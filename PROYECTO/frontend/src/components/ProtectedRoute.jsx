// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Importa useSelector para acceder al estado de Redux

/**
 * Componente para proteger rutas.
 * Verifica si el usuario está autenticado y si tiene los roles permitidos.
 * @param {Array<string>} allowedRoles - Array de roles permitidos (ej. ['Admin', 'SuperAdmin']).
 * Si está vacío, solo requiere autenticación.
 * @param {string} redirectTo - Ruta a la que redirigir si el acceso es denegado.
 * @returns {JSX.Element} - Outlet si tiene acceso, Navigate si no.
 */
const ProtectedRoute = ({ allowedRoles = [], redirectTo = '/login' }) => {
  // Accede al estado de autenticación directamente desde Redux
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // Asume que el objeto user en Redux tiene una propiedad 'rol' (ej. user.rol = "Admin")
  const userRole = useSelector((state) => state.auth.user?.rol); 
  const authStatus = useSelector((state) => state.auth.status); // 'idle', 'loading', 'succeeded', 'failed'

  // Muestra un indicador de carga mientras el estado de autenticación es 'loading'
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Cargando autenticación...</div>
      </div>
    );
  }

  // 1. Si el usuario no está autenticado, redirige a la página de login.
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 2. Si se especificaron roles permitidos, verifica si el rol del usuario está incluido.
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Si el usuario está autenticado pero no tiene el rol permitido, redirige a la página de no autorizado.
    return <Navigate to="/unauthorized" replace />;
  }

  // Si todas las condiciones se cumplen, renderiza el contenido de la ruta anidada.
  return <Outlet />;
};

export default ProtectedRoute;
