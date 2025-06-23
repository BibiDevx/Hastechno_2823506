    // src/pages/UnauthorizedPage.jsx
    import React from 'react';
    import { Link } from 'react-router-dom';

    const UnauthorizedPage = () => {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-lg text-gray-800 mb-8 text-center">
            No tienes los permisos necesarios para ver esta página.
          </p>
          <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
            Volver al inicio
          </Link>
        </div>
      );
    };

    export default UnauthorizedPage;
    