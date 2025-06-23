import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// Importamos la acción logout del authSlice
import { logout } from "../../redux/authSlice";
// Importamos la acción clearLocalCart del cartSlice
import { clearLocalCart } from "../../redux/cartSlice"; // Asegúrate de que esta ruta sea correcta
import authServices from "../../services/authService"; // Todavía usamos el servicio para la llamada al backend de logout

function Navbar() {
  // Ahora useSelector para 'usuario' debería ser 'auth.user'
  const usuario = useSelector((state) => state.auth.user); 
  // Ahora cartItems es state.carrito.items porque el slice de carrito tiene un objeto con 'items'
  const cartItems = useSelector((state) => state.carrito.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // El cálculo del carrito ahora usa cartItems directamente
  const cartCount = cartItems.reduce(
    (total, item) => total + (item.cantidad || 0), // Aseguramos 0 si cantidad es undefined/null
    0
  );

  const handleLogout = async () => {
    try {
      // Si tu backend tiene un endpoint para 'logout' que invalida el token
      // puedes mantener esta línea. Si solo invalida el token en el cliente,
      // esta llamada puede no ser estrictamente necesaria si el token se elimina localmente.
      await authServices.logout(); 
    } catch (error) {
      console.error("Error al cerrar sesión en el backend:", error);
      // Aquí podrías mostrar un mensaje de error al usuario si la llamada al backend falla
      // Aunque el logout local y la redirección se ejecutarán de todas formas.
    } finally {
      // Disparamos la acción 'logout' de authSlice.
      // Esta acción limpia el estado de auth en Redux y el token de localStorage.
      dispatch(logout()); 
      
      // Además, disparamos la acción 'clearLocalCart' del cartSlice.
      // Esto limpia el carrito del estado de Redux y elimina el guest_id de localStorage.
      dispatch(clearLocalCart());

      // Redirige al usuario a la página de login
      navigate("/login");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary p-3">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">
          Hastechno
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarHeader"
          aria-controls="navbarHeader"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarHeader"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/productos" className="nav-link">
                Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/marcas" className="nav-link">
                Marcas
              </Link>
            </li>
          </ul>

          <Link
            to="/CarritoPage" // Asegúrate de que esta ruta lleve a tu CarritoPage/Checkout
            className="btn btn-outline-light me-3 btn-sm d-flex align-items-center position-relative"
            style={{
              minWidth: "120px",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
            }}
          >
            <i className="bi bi-cart-fill me-2"></i>
            <span className="text-white">Carrito</span>
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.7em" }}
              >
                {cartCount}
                <span className="visually-hidden">items in cart</span>
              </span>
            )}
          </Link>

          {usuario ? (
            <div className="dropdown">
              <button
                className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  minWidth: "120px",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.25rem",
                }}
              >
                <i className="bi bi-person-fill me-2"></i>
                {/* Asumimos que usuario.nombre tiene el nombre a mostrar */}
                <span className="text-white">{usuario.nombre || usuario.email || 'Usuario'}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end bg-light border-0 shadow-sm">
                <li>
                  <Link
                    to="/perfil"
                    className="dropdown-item text-secondary d-flex align-items-center"
                  >
                    <i className="bi bi-person me-2"></i> Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    to="/editar-perfil"
                    className="dropdown-item text-secondary d-flex align-items-center"
                  >
                    <i className="bi bi-pencil me-2"></i> Editar Perfil
                  </Link>
                </li>
                 <li>
                  <Link
                    to="/historial"
                    className="dropdown-item text-secondary d-flex align-items-center"
                  >
                    <i className="bi bi-box-seam me-2"></i> Mis Pedidos
                  </Link>
                </li> 
                <li>
                  <button
                    className="dropdown-item text-secondary d-flex align-items-center"
                    onClick={handleLogout}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-outline-light btn-sm d-flex align-items-center"
              style={{
                minWidth: "120px",
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
              }}
            >
              <i className="bi bi-person-circle me-2"></i>
              <span className="text-white">Login</span>
            </Link>
          )}
        </div>
      </div>
      <style type="text/css">
        {`
          .btn-outline-light:hover {
            color: #f8f9fa !important;
            background-color:rgb(12, 79, 180) !important;
            border-color: #f8f9fa !important;
          }

          .dropdown-item:hover {
            background-color: #e9ecef !important; /* Gris claro de Bootstrap para el hover */
            color: #000 !important; /* Texto negro al pasar el ratón */
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;