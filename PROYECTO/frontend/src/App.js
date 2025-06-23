import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import ClienteRoutes from "./routes/ClienteRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import Navbar from "./components/client/Navbar";
import Perfil from "./components/client/Perfil";
import EditarPerfil from "./components/client/EditarPerfil";
import SidebarAdmin from "./components/admin/SidebarAdmin";
import ProductInfo from "./components/client/ProductInfo";
import ProductosPorMarca from "./components/client/ProductosPorMarca";
import ProductoCategorias from './components/admin/productosCategorias';
import Historial from './components/client/Historial';
import OrderDetails from "./components/client/OrderDetails";

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const usuario = useSelector((state) => state.auth.usuario);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si no hay usuario logueado, no hacemos nada de redirección basada en roles.
    if (!usuario) return;

    const currentPath = location.pathname;

    // Lógica de redirección inicial según el rol del usuario
    if (usuario.rol === "Admin") {
      // Si es Admin y NO está en una ruta que comienza con /admin, lo redirigimos a /admin.
      if (!currentPath.startsWith("/admin")) {
        navigate("/admin");
      }
    } else if (usuario.rol === "SuperAdmin") {
      // Si es SuperAdmin:
      // Lo dejamos pasar si está en una ruta de /superadmin o /admin.
      // Si no está en NINGUNA de esas, lo redirigimos a su dashboard por defecto.
      if (!currentPath.startsWith("/superadmin") && !currentPath.startsWith("/admin")) {
        navigate("/admin"); // Ruta por defecto para SuperAdmin
      }
    } else if (usuario.rol === "Cliente") {
      // Si es Cliente y está intentando acceder a una ruta de admin/superadmin, lo redirigimos a su perfil.
      if (currentPath.startsWith("/admin") || currentPath.startsWith("/superadmin")) {
        navigate("/perfil");
      }
    }
  }, [usuario, location.pathname, navigate]);

  // Decidimos si mostrar el SidebarAdmin o la Navbar.
  // El SidebarAdmin se muestra si la ruta actual empieza con /admin o /superadmin.
  const isAdminOrSuperAdminRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/superadmin");

  return (
    <div className="d-flex">
      {/* Mostrar SidebarAdmin si la ruta es de administración/superadministración */}
      {isAdminOrSuperAdminRoute && <SidebarAdmin />}

      <div className="flex-grow-1">
        {/* Mostrar Navbar si la ruta NO es de administración/superadministración */}
        {!isAdminOrSuperAdminRoute ? <Navbar /> : null}

        <Routes>
          {/* Rutas para administradores: tanto 'Admin' como 'SuperAdmin' accederán aquí. */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Rutas para superadministradores: Si son las mismas que Admin, usamos AdminRoutes.
              Si SuperAdmin tuviera rutas exclusivas, se definirían aquí con un componente aparte. */}
          <Route path="/superadmin/*" element={<AdminRoutes />} />

          {/* Rutas para clientes y rutas públicas */}
          <Route path="/*" element={<ClienteRoutes />} />

          {/* Rutas específicas fuera de los grupos principales (cliente) */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/info/:idProducto" element={<ProductInfo />} />
          <Route path="/productos/marca/:idMarca" element={<ProductosPorMarca />} />
          <Route path="/Historial/" element={<Historial />} />
          <Route path="/Historial/:id" element={<OrderDetails />} />

          {/* Considera si esta ruta debe ser accesible para todos o solo para admins.
              Si es solo para admins, lo ideal es moverla DENTRO de AdminRoutes. */}
          <Route path="/admin/productos/:idProducto/categorias" element={<ProductoCategorias />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;