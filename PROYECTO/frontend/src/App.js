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
import ProductoCategorias from './components/admin/productosCategorias'; // Asumiendo que es el path correcto

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
    if (!usuario) return; // Si no hay usuario, no hacer nada

    const currentPath = location.pathname;

    // Lógica de redirección más precisa para evitar bucles:
    if (usuario.rol === "Admin") {
      // Si el usuario es Admin y NO está en una ruta que comienza con /admin,
      // redirige a /admin. Si ya está en /admin/*, no hace nada.
      if (!currentPath.startsWith("/admin")) {
        navigate("/admin");
      }
    } else if (usuario.rol === "SuperAdmin") {
      // Si el usuario es SuperAdmin y NO está en una ruta que comienza con /superadmin,
      // redirige a /superadmin/dashboard. Si ya está en /superadmin/*, no hace nada.
      if (!currentPath.startsWith("/superadmin")) {
        navigate("/superadmin/dashboard"); // O la ruta por defecto que quieras
      }
    } else if (usuario.rol === "cliente") {
      // Si el usuario es cliente y está en una ruta de admin o superadmin,
      // redirige a /perfil.
      if (currentPath.startsWith("/admin") || currentPath.startsWith("/superadmin")) {
        navigate("/perfil");
      }
    }
    // Si ninguna de las condiciones anteriores se cumple, significa que el usuario
    // ya está en una ruta adecuada para su rol, o no tiene un rol que requiera redirección
    // inmediata, por lo que no se llama a 'navigate'.
  }, [usuario, location.pathname, navigate]); // Usamos location.pathname para que el efecto solo reaccione a cambios de ruta, no a otros cambios en el objeto location

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");

  return (
    <div className="d-flex">
      {(isAdminRoute || isSuperAdminRoute) && <SidebarAdmin />}
      <div className="flex-grow-1">
        {!(isAdminRoute || isSuperAdminRoute) ? <Navbar /> : null}
        <Routes>
          {/* Rutas de administración */}
          {/* Es más común tener un Route Wrapper para rutas protegidas */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          {/* Rutas de superadministración */}
          <Route path="/superadmin/*" element={<AdminRoutes />} /> {/* Asumiendo que AdminRoutes sirve también para SuperAdmin */}
          {/* Rutas de cliente */}
          <Route path="/*" element={<ClienteRoutes />} />
          {/* Rutas específicas */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/info/:idProducto" element={<ProductInfo />} />
          <Route path="/productos/marca/:idMarca" element={<ProductosPorMarca />} />
          {/* Asegúrate de que esta ruta no se solape con ninguna otra ruta de AdminRoutes o ClienteRoutes si están definidas como comodín */}
          <Route path="/admin/productos/:idProducto/categorias" element={<ProductoCategorias />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;