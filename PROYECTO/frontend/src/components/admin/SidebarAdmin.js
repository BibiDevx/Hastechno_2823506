// src/components/SidebarAdmin.js
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice"; // Importa la acción logout del authSlice
import authServices from "../../services/authService"; // Importa el servicio de autenticación

export default function SidebarAdmin() {
  const [isGestionOpen, setIsGestionOpen] = useState(false);
  const [isConfiguracionOpen, setIsConfiguracionOpen] = useState(false);
  const [isUsuariosOpen, setIsUsuariosOpen] = useState(false);

  // Accedemos directamente al objeto 'user' del estado de autenticación de Redux
  const user = useSelector((state) => state.auth.user); 
  // Accedemos al nombre del rol para las comparaciones de permisos
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleGestion = () => setIsGestionOpen(!isGestionOpen);
  const toggleConfiguracion = () => setIsConfiguracionOpen(!isConfiguracionOpen);
  const toggleUsuarios = () => setIsUsuariosOpen(!isUsuariosOpen);

  const handleLogout = async () => {
    try {
      await authServices.logout(); // Llama al servicio para cerrar sesión en el backend
    } catch (error) {
      console.error("Error al cerrar sesión en el backend:", error);
      // Aunque haya un error en el backend, procedemos a limpiar el estado local
    } finally {
      dispatch(logout()); // Despacha la acción de logout para limpiar el estado de Redux y localStorage
      navigate("/login"); // Redirige al usuario a la página de login
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
      {user && ( // Usamos 'user' en lugar de 'usuario' para consistencia con Redux
        <div className="d-flex align-items-center justify-content-center mb-3">
          <i className="bi bi-person-circle-fill me-2 fs-6 text-secondary"></i>
          <p className="text-white mb-0 small text-center">{user.email}</p>
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
          {/* ✅ CORREGIDO: Ahora el colapso de Gestión depende del estado isGestionOpen */}
          <div className={`collapse ${isGestionOpen ? "show" : ""} ms-3`}>
            {/* Siempre visible, no depende del rol */}
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
            {/* Estos enlaces solo se muestran si el usuario tiene el rol "SuperAdmin".
              Asegúrate de que 'user.rol' contenga el valor correcto del rol del usuario.
            */}
            {user?.rol === "SuperAdmin" && (
              <Link className="nav-link text-white py-1" to="/admin/usuarios-y-roles">
                Usuarios y Roles
              </Link>
            )}
            
            {user?.rol === "SuperAdmin" && (
              <Link className="nav-link text-white py-1" to="/admin/usuarios/admin">
                Admins
              </Link>
            )}
            
            {user?.rol === "SuperAdmin" && (
              <Link className="nav-link text-white py-1" to="/admin/usuarios/roles">
                Roles
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
                cursor: "pointer", // Asegurar que tenga cursor de puntero
                width: "100%", // Asegurar que ocupe todo el ancho
                textAlign: "left" // Alinear el texto a la izquierda
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
