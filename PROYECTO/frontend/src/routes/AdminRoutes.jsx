import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";
import ProductosAdmin from "../pages/admin/ProductosAdmin";
import PedidosAdmin from "../pages/admin/PedidosAdmin";
import UsuariosAdmin from "../pages/admin/UsuariosAdmin";
import UsuariosCliente from "../pages/admin/UsuariosCliente";
import MarcasAdmin from "../pages/admin/MarcasAdmin";
import CategoriasAdmin from "../pages/admin/CategoriasAdmin";
import PerfilAdmin from "../pages/admin/PerfilAdmin";
import RolesAdmin from "../pages/admin/RolesAdmin";


export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/productos" element={<ProductosAdmin />} />
      <Route path="/pedidos" element={<PedidosAdmin />} />
      <Route path="/usuarios/admin" element={<UsuariosAdmin />} />
      <Route path="/usuarios/roles" element={<RolesAdmin />} />
      <Route path="/usuarios/cliente" element={<UsuariosCliente />} />
      <Route path="/marcas" element={<MarcasAdmin />} />
      <Route path="/categorias" element={<CategoriasAdmin />} />
      <Route path="/perfil" element={<PerfilAdmin />} />
    </Routes>
  );
}
