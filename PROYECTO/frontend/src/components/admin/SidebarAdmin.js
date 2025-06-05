// src/components/SidebarAdmin.js
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import authServices from "../../services/authService";

export default function SidebarAdmin() {
  const [isGestionOpen, setIsGestionOpen] = useState(false);
  const [isConfiguracionOpen, setIsConfiguracionOpen] = useState(false);
  const [isUsuariosOpen, setIsUsuariosOpen] = useState(false);
  const usuario = useSelector((state) => state.auth.usuario);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleGestion = () => setIsGestionOpen(!isGestionOpen);
  const toggleConfiguracion = () => setIsConfiguracionOpen(!isConfiguracionOpen);
  const toggleUsuarios = () => setIsUsuariosOpen(!isUsuariosOpen);

  const handleLogout = async () => {
    try {
      await authServices.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div
      className="d-flex flex-column p-3 bg-dark text-white min-vh-100 shadow-sm"
      style={{ width: "260px" }}
    >
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-gear-fill me-2 fs-5"></i>
        <h4 className="text-center mb-0 fw-bold">Admin Panel</h4>
      </div>
      {usuario && (
        <div className="d-flex align-items-center justify-content-center mb-3">
          <i className="bi bi-person-circle-fill me-2 fs-6 text-secondary"></i>
          <p className="text-white mb-0 small text-center">{usuario.nombre}</p>
        </div>
      )}
      <hr className="text-secondary mb-3" />
      <h6 className="text-white-50 mb-3">MENÚ</h6>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link className="nav-link text-white d-flex align-items-center" to="/admin/">
            <i className="bi bi-speedometer2 me-2 fs-6"></i> Dashboard
          </Link>
        </li>
        <li className="nav-item mb-2">
          <div
            onClick={toggleGestion}
            style={{ cursor: "pointer" }}
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-box-seam me-2 fs-6"></i> Gestión
            <i
              className={`bi ${
                isGestionOpen ? "bi-chevron-up" : "bi-chevron-down"
              } ms-auto`}
            ></i>
          </div>
          <div className={`collapse ${isGestionOpen ? "show" : ""} ms-3`}>
            <Link className="nav-link text-white py-1" to="/admin/productos">
              Productos
            </Link>
            <Link className="nav-link text-white py-1" to="/admin/marcas">
              Marcas
            </Link>
            <Link className="nav-link text-white py-1" to="/admin/categorias">
              Categorías
            </Link>
          </div>
        </li>
        <li className="nav-item mb-2">
          <div
            onClick={toggleUsuarios}
            style={{ cursor: "pointer" }}
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-people-fill me-2 fs-6"></i> Usuarios
            <i
              className={`bi ${
                isUsuariosOpen ? "bi-chevron-up" : "bi-chevron-down"
              } ms-auto`}
            ></i>
          </div>
          <div className={`collapse ${isUsuariosOpen ? "show" : ""} ms-3`}>
            {usuario?.rol === "SuperAdmin" && (
              <Link className="nav-link text-white py-1" to="/admin/usuarios/admin">
                Admins
              </Link>
            )}
            <Link className="nav-link text-white py-1" to="/admin/usuarios/cliente">
              Clientes
            </Link>
          </div>
        </li>
        <li className="nav-item mb-2">
          <Link
            className="nav-link text-white d-flex align-items-center"
            to="/admin/proveedores"
          >
            <i className="bi bi-truck me-2 fs-6"></i> Proveedores
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link
            className="nav-link text-white d-flex align-items-center"
            to="/admin/pedidos"
          >
            <i className="bi bi-cart-fill me-2 fs-6"></i> Pedidos
          </Link>
        </li>
        <li className="nav-item mt-4">
          <div
            onClick={toggleConfiguracion}
            style={{ cursor: "pointer" }}
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-gear me-2 fs-6"></i> Configuración
            <i
              className={`bi ${
                isConfiguracionOpen ? "bi-chevron-up" : "bi-chevron-down"
              } ms-auto`}
            ></i>
          </div>
          <div className={`collapse ${isConfiguracionOpen ? "show" : ""} ms-3`}>
            <Link className="nav-link text-white py-1" to="/admin/perfil">
              Perfil
            </Link>
            <button
              className="nav-link text-white py-1"
              onClick={handleLogout}
              style={{
                border: "none",
                background: "transparent",
                paddingLeft: "1rem",
              }}
            >
              <i className="bi bi-box-arrow-left me-2 fs-6"></i> Logout
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
}