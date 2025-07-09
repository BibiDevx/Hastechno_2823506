// src/pages/client/CheckoutPage.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link
import { fetchCartItems, placeOrder, clearLocalCart } from '../../redux/cartSlice'; 
import authServices from "../../services/authService"; // Importado authServices
import 'bootstrap/dist/css/bootstrap.min.css';


const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Estado de autenticación general

  // Estados locales para el perfil del usuario, al igual que en Perfil.js
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const cartItems = useSelector((state) => state.carrito.items);
  const cartStatus = useSelector((state) => state.carrito.status); 
  const cartError = useSelector((state) => state.carrito.error); 
  const orderStatus = useSelector((state) => state.carrito.orderStatus); 
  const orderError = useSelector((state) => state.carrito.error); 

  // ✅ Estado para el método de pago seleccionado
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Tarjeta de Crédito'); // Valor por defecto

  // ✅ Métodos de pago disponibles (con imágenes de placeholder) - ACTUALIZADO
  const paymentMethods = [
    { name: 'Tarjeta de Crédito', icon: 'bi-credit-card-fill', image: 'https://placehold.co/100x40/3366cc/ffffff?text=Tarjeta+Crédito' },
    { name: 'Tarjeta de Débito', icon: 'bi-credit-card', image: 'https://placehold.co/100x40/6c757d/ffffff?text=Tarjeta+Débito' }, // Cambiado de Transferencia Bancaria
    { name: 'Efecty', icon: 'bi-cash-coin', image: 'https://placehold.co/100x40/ffc107/000000?text=Efecty' }, // Nuevo método de pago
  ];

  // Efecto para cargar el perfil del usuario y el carrito
  useEffect(() => {
    const fetchUserProfileAndCart = async () => {
      // Cargar perfil del usuario
      if (!isAuthenticated) {
        setProfileLoading(false); // Si no está autenticado, no hay perfil que cargar
        setProfileError("No estás autenticado para ver tu perfil.");
      } else {
        setProfileLoading(true);
        setProfileError("");
        try {
          const data = await authServices.getProfile();
          setUserProfile(data); // Asigna la data directamente (objeto anidado)
          setProfileError("");
        } catch (err) {
          console.error("Error al obtener el perfil para Checkout:", err);
          setProfileError(err.message || "No se pudo obtener la información de tu perfil.");
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      }

      // Cargar ítems del carrito
      if (cartStatus === 'idle' || (cartStatus === 'failed' && cartItems.length === 0)) {
        dispatch(fetchCartItems());
      }
    };

    fetchUserProfileAndCart();
  }, [dispatch, isAuthenticated, cartStatus, cartItems.length]); // Dependencias para re-ejecutar

  // Redirigir si el carrito está vacío después de un intento de carga
  useEffect(() => {
    // Si la carga del carrito fue exitosa y no hay ítems, alerta y redirige
    if (cartStatus === 'succeeded' && cartItems.length === 0 && !profileLoading && isAuthenticated) {
      alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
      navigate('/productos'); // Redirige a la página de productos
    }
  }, [cartStatus, cartItems.length, navigate, profileLoading, isAuthenticated]);

  // Manejar la respuesta de la acción placeOrder
  useEffect(() => {
    if (orderStatus === 'succeeded') {
      alert('¡Pedido realizado con éxito! Te hemos enviado una confirmación.');
      dispatch(clearLocalCart()); // Limpia el carrito localmente
      navigate('/historial'); // Redirige a la página de confirmación
    } else if (orderStatus === 'failed') {
      // Manejo de error de pedido, el mensaje se mostrará en el alert de error
      // console.error("Error al realizar el pedido:", orderError); // Ya se loguea en el slice
    }
  }, [orderStatus, orderError, navigate, dispatch]);

  // Calcula el total del carrito
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.producto?.valorProducto || 0) * (item.cantidad || 0), 0);
  };

  /**
   * Maneja el clic en el botón de confirmar pedido.
   * Realiza validaciones y despacha la acción para crear el pedido.
   */
  const handleConfirmOrder = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para finalizar la compra.');
      navigate('/login'); 
      return;
    }
    
    // Validar que la información de perfil esté completa
    if (!userProfile?.email || !userProfile?.cliente?.nombreCliente || !userProfile?.cliente?.apellidoCliente || 
        !userProfile?.cliente?.direccion || !userProfile?.cliente?.telefonoCliente || !userProfile?.cliente?.cedulaCliente) { 
      alert('Tu información de perfil está incompleta (nombre, apellido, email, dirección, teléfono, cédula son obligatorios). Por favor, edítala en la sección "Mi Perfil".');
      navigate('/editar-perfil'); // Asegúrate de que esta ruta sea correcta
      return;
    }
    if (cartItems.length === 0) {
      alert('El carrito está vacío. Agregue productos antes de finalizar la compra.');
      return;
    }
    // ✅ Validar que se haya seleccionado un método de pago
    if (!selectedPaymentMethod) {
        alert("Por favor, selecciona un método de pago para continuar.");
        return;
    }

    const productosParaBackend = cartItems.map(item => ({
      idProducto: item.idProducto,
      cantidad: item.cantidad
    }));

    // Despacha la acción placeOrder con los productos y el método de pago
    dispatch(placeOrder({
      productos: productosParaBackend,
      metodo_pago: selectedPaymentMethod, // ✅ Envía el método de pago seleccionado
      // Puedes añadir más datos del cliente si el backend los necesita explícitamente en el payload del pedido
      // (ej. direccion_envio: userProfile.cliente.direccion, etc.)
    }));
  };

  // ✅ Los estados de loading/error combinan los del carrito, los del pedido y los del perfil
  const isLoading = cartStatus === 'loading' || orderStatus === 'loading' || profileLoading;
  const hasError = cartStatus === 'failed' || orderStatus === 'failed' || profileError;
  const isDisabled = isLoading || cartItems.length === 0 || !isAuthenticated || !userProfile || !userProfile.cliente;


  if (isLoading) { 
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 fs-5 text-muted">Cargando información, por favor espera...</p>
      </div>
    );
  }

  // Si no está autenticado después de cargar el perfil
  if (!isAuthenticated) { 
      return (
          <div className="container mt-5 alert alert-warning text-center animated fadeIn" role="alert">
              <i className="bi bi-person-exclamation me-2"></i> Debes <a href="/login" className="alert-link">iniciar sesión</a> para finalizar la compra.
          </div>
      );
  }

  // Si hay error en carrito, pedido o perfil
  if (hasError) { 
    return (
      <div className="container mt-5 alert alert-danger animated fadeIn" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i> Error: {cartError || orderError || profileError || "Error desconocido."}
        {(!userProfile || !userProfile.cliente) && (
            <p className="mt-2 mb-0">Por favor, asegúrate de que tu perfil esté completo o contacta con soporte.</p>
        )}
      </div>
    );
  }

  // Si no hay perfil de usuario cliente después de cargar y estar autenticado
  if (!userProfile || !userProfile.cliente) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center animated fadeIn" role="alert">
            <i className="bi bi-person-fill-exclamation me-2"></i> No se ha encontrado información de perfil completa para tu cuenta de cliente.
            <p className="mt-2 mb-0">Por favor, <Link to="/editar-perfil" className="alert-link">completa tu información de perfil</Link> (nombre, apellido, email, dirección, teléfono, cédula) para poder finalizar tu compra.</p>
        </div>
      </div>
    );
  }

  // Si el carrito está vacío después de cargar
  if (cartItems.length === 0) {
    return (
      <div className="container mt-5 alert alert-info text-center animated fadeIn" role="alert">
        <i className="bi bi-cart-x-fill me-2"></i> Tu carrito está vacío. 
        <Link to="/productos" className="alert-link ms-2">Explora nuestros productos</Link>.
      </div>
    );
  }


  return (
    <div className="container mt-5 mb-5 p-3">
      <style>
        {`
        .animated.fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .payment-method-option {
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .payment-method-option:hover {
          background-color: #f8f9fa;
          border-color: #007bff;
        }
        .payment-method-option input[type="radio"]:checked + label {
          color: #007bff !important;
        }
        `}
      </style>
      <h1 className="text-center fw-bold text-primary mb-5">
        <i className="bi bi-bag-check-fill me-3"></i>Finalizar Compra
      </h1>

      {orderError && ( // Mostrar error específico del pedido si existe
        <div className="alert alert-danger text-center animated fadeIn mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{orderError}
        </div>
      )}

      <div className="row g-4">
        {/* Columna de Información de Envío y Facturación (Izquierda) */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-lg rounded-3 h-100">
            <div className="card-header bg-info text-white fw-bold fs-5 py-3 rounded-top-3">
              <i className="bi bi-geo-alt-fill me-2"></i> Información de Envío y Facturación
            </div>
            <div className="card-body p-4">
              <p className="mb-3 text-muted fst-italic small">
                Verifica que tu información personal sea correcta. Para editar, haz clic en "Editar Información".
              </p>
              <form>
                {/* Campos de información del usuario */}
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label fw-semibold">Nombre:</label>
                  <input type="text" className="form-control rounded-pill" id="nombre" name="nombre" value={userProfile?.cliente?.nombreCliente || ''} readOnly />
                </div>
                <div className="mb-3">
                  <label htmlFor="apellido" className="form-label fw-semibold">Apellido:</label>
                  <input type="text" className="form-control rounded-pill" id="apellido" name="apellido" value={userProfile?.cliente?.apellidoCliente || ''} readOnly />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">Email:</label>
                  <input type="email" className="form-control rounded-pill" id="email" name="email" value={userProfile?.email || ''} readOnly />
                </div>
                <div className="mb-3">
                  <label htmlFor="telefono" className="form-label fw-semibold">Teléfono:</label>
                  <input type="tel" className="form-control rounded-pill" id="telefono" name="telefono" value={userProfile?.cliente?.telefonoCliente || ''} readOnly />
                </div>
                <div className="mb-3">
                  <label htmlFor="direccion" className="form-label fw-semibold">Dirección:</label>
                  <textarea className="form-control rounded-3" id="direccion" name="direccion" rows="3" value={userProfile?.cliente?.direccion || ''} readOnly></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="cedula" className="form-label fw-semibold">Cédula:</label>
                  <input type="text" className="form-control rounded-pill" id="cedula" name="cedula" value={userProfile?.cliente?.cedulaCliente || ''} readOnly />
                </div>
                {/* Botón para redirigir a la página de edición del perfil */}
                <div className="text-end mt-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-info btn-sm rounded-pill fw-semibold" 
                    onClick={() => navigate('/editar-perfil')} 
                  >
                    <i className="bi bi-pencil-fill me-1"></i> Editar Información
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Columna de Resumen del Pedido y Método de Pago (Derecha) */}
        <div className="col-lg-6 mb-4">
          {/* Sección de Resumen del Pedido */}
          <div className="card shadow-lg rounded-3 mb-4"> {/* mb-4 para espacio con el método de pago */}
            <div className="card-header bg-primary text-white fw-bold fs-5 py-3 rounded-top-3">
              <i className="bi bi-receipt me-2"></i> Resumen de tu Pedido
            </div>
            <div className="card-body p-4">
              {/* Lista de productos en el carrito */}
              <ul className="list-group list-group-flush mb-4">
                {cartItems.map((item) => (
                  <li key={item.idCarrito || item.idProducto} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div>
                      <span className="fw-semibold">{item.producto?.nombreProducto}</span>
                      <span className="text-muted ms-2">x {item.cantidad}</span>
                    </div>
                    <span className="fw-bold">${((item.producto?.valorProducto || 0) * (item.cantidad || 0)).toLocaleString('es-CO')}</span>
                  </li>
                ))}
              </ul>
              {/* Total a pagar */}
              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <h5 className="mb-0 fw-bold">Total a Pagar:</h5>
                <h5 className="mb-0 fw-bold text-primary">${calculateTotal().toLocaleString('es-CO')}</h5>
              </div>
            </div>
          </div>

          {/* ✅ Sección de Método de Pago */}
          <div className="card shadow-lg rounded-3">
            <div className="card-header bg-success text-white fw-bold fs-5 py-3 rounded-top-3">
              <i className="bi bi-credit-card-fill me-2"></i> Selecciona Método de Pago
            </div>
            <div className="card-body p-4">
              {paymentMethods.map((method) => (
                <div 
                  className={`form-check mb-3 p-3 border rounded-3 payment-method-option ${selectedPaymentMethod === method.name ? 'border-primary shadow-sm' : ''}`} 
                  key={method.name}
                  onClick={() => setSelectedPaymentMethod(method.name)} // Permite seleccionar haciendo clic en toda la card
                >
                  <input
                    className="form-check-input me-3"
                    type="radio"
                    name="paymentMethod"
                    id={method.name.replace(/\s/g, '')}
                    value={method.name}
                    checked={selectedPaymentMethod === method.name}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <label 
                    className="form-check-label d-flex align-items-center fw-semibold text-dark" 
                    htmlFor={method.name.replace(/\s/g, '')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className={`${method.icon} me-2 fs-5 text-muted`}></i>
                    {method.name}
                    <img src={method.image} alt={method.name} className="ms-auto img-fluid" style={{ maxHeight: '25px' }} />
                  </label>
                </div>
              ))}
              
              {/* Mensajes de estado de la operación (cargando, error) */}
              {orderStatus === 'loading' && (
                <div className="alert alert-info text-center mt-4 animated fadeIn" role="alert">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  Procesando su pedido...
                </div>
              )}
              {orderStatus === 'failed' && orderError && (
                <div className="alert alert-danger text-center mt-4 animated fadeIn" role="alert">
                  <i className="bi bi-x-circle-fill me-2"></i> Error: {orderError.message || 'Hubo un problema al confirmar su compra.'}
                </div>
              )}

              {/* Botón para confirmar el pedido */}
              <button
                onClick={handleConfirmOrder}
                className="btn btn-success btn-lg w-100 mt-4 rounded-pill fw-bold"
                // Deshabilita si está cargando, el carrito está vacío, no está autenticado,
                // no hay perfil de usuario, o no se ha seleccionado un método de pago.
                disabled={isDisabled}
              >
                <i className="bi bi-check-circle-fill me-2"></i> Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer del sitio */}
      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default CheckoutPage;
