// src/routes/AdminRoutes.jsx
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
import Roles from "../pages/admin/Roles";
import Proveedor from "../pages/admin/Proveedor";
import ProductoCategorias from '../components/admin/productosCategorias'; // Mover aquí para que esté bajo /admin/*
import ProductosBajoStock from "../pages/admin/ProductosBajoStock";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Todas estas rutas están protegidas por el ProtectedRoute que las envuelve en App.js */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/productos" element={<ProductosAdmin />} />
      <Route path="/productos-stock-bajo" element={<ProductosBajoStock />} />
      <Route path="/pedidos" element={<PedidosAdmin />} />
      <Route path="/usuarios/admin" element={<UsuariosAdmin />} />
      <Route path="/usuarios-y-roles" element={<RolesAdmin />} />
      <Route path="/usuarios/roles" element={<Roles />} />
      <Route path="/usuarios/cliente" element={<UsuariosCliente />} />
      <Route path="/marcas" element={<MarcasAdmin />} />
      <Route path="/categorias" element={<CategoriasAdmin />} />
      <Route path="/proveedores" element={<Proveedor />} />
      <Route path="/perfil" element={<PerfilAdmin />} />
      {/* Esta ruta se mueve aquí para que esté correctamente bajo el prefijo /admin/* */}
      <Route path="/productos/:idProducto/categorias" element={<ProductoCategorias />} />
    </Routes>
  );
}
