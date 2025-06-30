// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
// No necesitamos useSelector directamente aquí en MainLayout ya que ProtectedRoute lo maneja

import ClienteRoutes from "./routes/ClienteRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import Navbar from "./components/client/Navbar";
import SidebarAdmin from "./components/admin/SidebarAdmin";
import ProductInfo from "./components/client/ProductInfo";
import ProductosPorMarca from "./components/client/ProductosPorMarca";

// Páginas públicas que pueden ser accedidas por todos
import Login from "./pages/client/Login";
import RegistroCliente from "./pages/client/registro";
import RecuperacionCliente from "./pages/client/recuperar";
import UnauthorizedPage from "./pages/UnauthorizedPage"; // Asegúrate de crear esta página

// Componente de protección de rutas
import ProtectedRoute from "./components/ProtectedRoute"; 

// Páginas de cliente que requieren autenticación
import Perfil from "./components/client/Perfil";
import EditarPerfil from "./components/client/EditarPerfil";
import Historial from './components/client/Historial';
import OrderDetails from "./components/client/OrderDetails";
import CarritoPage from "./pages/client/CarritoPage"; // Mover aquí para proteger
import CheckoutPage from "./pages/client/CheckoutPage"; // Mover aquí para proteger


function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation();

  // Determina si la ruta actual es de administración/superadministración para mostrar el Sidebar
  const isAdminOrSuperAdminRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/superadmin");

  return (
    <div className="d-flex">
      {/* Mostrar SidebarAdmin solo si la ruta es de administración/superadministración */}
      {isAdminOrSuperAdminRoute && <SidebarAdmin />}

      <div className="flex-grow-1">
        {/* Mostrar Navbar solo si la ruta NO es de administración/superadministración */}
        {!isAdminOrSuperAdminRoute ? <Navbar /> : null}

        <Routes>
          {/* RUTAS PÚBLICAS (Accesibles para cualquier usuario, logueado o no)
          */}
          {/* El ClienteRoutes ahora solo maneja rutas públicas de navegación principal */}
          <Route path="/*" element={<ClienteRoutes />} />

          {/* Rutas de autenticación y utilidades públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroCliente />} />
          <Route path="/recuperar" element={<RecuperacionCliente />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} /> {/* Página de acceso denegado */}
          <Route path="/CarritoPage" element={<CarritoPage />} />
          
          {/* Rutas de información de producto que no requieren autenticación */}
          <Route path="/info/:idProducto" element={<ProductInfo />} />
          <Route path="/productos/marca/:idMarca" element={<ProductosPorMarca />} />


          {/* RUTAS PROTEGIDAS PARA ADMINISTRADORES (Requieren autenticación y rol 'Admin' o 'SuperAdmin')
          */}
          <Route 
            element={
              <ProtectedRoute 
                allowedRoles={['Admin', 'SuperAdmin']} 
                redirectTo="/login" // Redirige al login general si no está autenticado
              />
            }
          >
            {/* Todas las rutas que comienzan con /admin o /superadmin serán protegidas por este ProtectedRoute */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/superadmin/*" element={<AdminRoutes />} /> {/* Asumo que SuperAdmin usa las mismas rutas de AdminRoutes */}
          </Route>

          {/* RUTAS PROTEGIDAS PARA CLIENTES (Requieren autenticación, cualquier usuario logueado)
          */}
          <Route element={<ProtectedRoute redirectTo="/login" />}>
            {/* Estas rutas requieren que el usuario esté logueado, sin importar el rol (ej. Cliente) */}
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/editar-perfil" element={<EditarPerfil />} />
            <Route path="/Historial/" element={<Historial />} />
            <Route path="/Historial/:id" element={<OrderDetails />} />
            <Route path="/CheckoutPage" element={<CheckoutPage />} />
          </Route>

        </Routes>
      </div>
    </div>
  );
}

export default App;
