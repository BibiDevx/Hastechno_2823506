// src/pages/OrderHistoryPage.js

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link
import { fetchUserOrders } from '../../redux/ordersSlice';
import 'bootstrap/dist/css/bootstrap.min.css';

function HistoryPage() { // Renombrado a OrderHistoryPage para consistencia
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userOrders, status, error } = useSelector((state) => state.orders);

  // Cargar los pedidos del usuario cuando el componente se monta
  useEffect(() => {
    // Solo si el estado es 'idle', despacha la acción para cargar los pedidos
    // Esto evita recargar innecesariamente si ya están 'succeeded'
    if (status === 'idle') {
      dispatch(fetchUserOrders());
    }
  }, [status, dispatch]);

  /**
   * Navega a la página de detalles de un pedido específico.
   * @param {number} orderId - El ID del pedido a ver.
   */
  const handleViewOrderDetails = (orderId) => {
    navigate(`/historial/${orderId}`); // Asegúrate de que esta ruta coincida con tu App.js
  };

  /**
   * Función auxiliar para calcular el total del pedido.
   * Asume que `item.valorTotal` ya es el valor total por ítem (precio * cantidad).
   * @param {Array} productos - Array de objetos PedidoProducto.
   * @returns {number} El total del pedido.
   */
  const calculateOrderTotal = (productos) => {
    // Verifica si productos es un array antes de reducir
    if (!Array.isArray(productos)) {
        return 0;
    }
    return productos.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
  };

  // --- Renderizado basado en el estado de la carga ---
  if (status === 'loading') {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando historial de pedidos...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando tu historial de pedidos...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> Error al cargar el historial de pedidos: {error || 'Algo salió mal.'}
        </div>
        <Link to="/" className="btn btn-outline-primary mt-3">
            <i className="bi bi-arrow-left me-2"></i> Volver a la página principal
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5"> {/* Añadido mb-5 para espacio con el footer */}
      <h1 className="text-center fw-bold text-primary mb-5">
        <i className="bi bi-clock-history me-3"></i> Mi Historial de Pedidos
      </h1>

      {userOrders.length === 0 ? (
        // Mensaje cuando no hay pedidos
        <div className="alert alert-info text-center py-4" role="alert">
          <i className="bi bi-box-seam-fill me-2 fs-4"></i>
          <p className="mb-0 fs-5">No has realizado ningún pedido todavía.</p>
          <p className="mb-0 text-muted">¡Anímate a explorar nuestros productos y realizar tu primera compra!</p>
          <Link to="/productos" className="btn btn-outline-primary mt-3 rounded-pill">
            <i className="bi bi-shop me-2"></i> Ir a la Tienda
          </Link>
        </div>
      ) : (
        // Lista de pedidos
        <ul className="list-unstyled"> {/* list-unstyled para eliminar los puntos de la lista */}
          {userOrders.map((order) => (
            <li key={order.idPedido} className="mb-4">
              <div className="card shadow-sm rounded-lg order-card-hover"> {/* shadow-sm, rounded-lg, order-card-hover */}
                {/* Encabezado del pedido */}
                <div className="card-header bg-light fw-bold fs-5 py-3 d-flex justify-content-between align-items-center rounded-top-lg">
                  <div>
                    <span className="text-primary me-3">Pedido #<span className="fw-bolder">{order.idPedido}</span></span>
                    <span className="text-muted small">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(order.fechaPedido).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  {/* Puedes añadir un badge de estado aquí si tu modelo de Pedido tiene un campo 'estadoPedido' */}
                  {/* <span className="badge bg-info text-dark">Estado: {order.estadoPedido || 'Confirmado'}</span> */}
                </div>
                
                {/* Cuerpo de la tarjeta con los detalles del pedido */}
                <div className="card-body p-4">
                  <h4 className="fw-semibold mb-3 text-secondary">Artículos del Pedido:</h4>
                  <ul className="list-group list-group-flush mb-4">
                    {Array.isArray(order.productos) && order.productos.length > 0 ? (
                      order.productos.map(item => (
                        <li key={item.idPedidoProducto || item.idProducto} className="list-group-item d-flex justify-content-between align-items-center px-0">
                          <div>
                            <span className="fw-semibold">{item.producto?.nombreProducto || 'Producto Desconocido'}</span>
                            <span className="text-muted ms-2 small">x {item.cantidadProducto}</span>
                          </div>
                          <span className="fw-bold">${(item.valorTotal || 0).toLocaleString('es-CO')}</span>
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item text-muted text-center px-0">No hay productos asociados a este pedido.</li>
                    )}
                  </ul>
                  
                  {/* Total del Pedido */}
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <h5 className="mb-0 fw-bold">Total del Pedido:</h5>
                    <h5 className="mb-0 fw-bold text-primary">${calculateOrderTotal(order.productos).toLocaleString('es-CO')}</h5>
                  </div>

                  {/* Detalles de la Factura (si existen) */}
                  {order.factura && (
                    <div className="mt-4 pt-3 border-top border-dashed"> {/* border-dashed para un divisor más suave */}
                      <h5 className="fw-semibold mb-2 text-info">Detalles de Factura:</h5>
                      
                      <p className="mb-1 small text-muted">
                        <i className="bi bi-calendar-check me-1"></i>
                        Fecha Factura: <span className="fw-semibold text-dark">{new Date(order.factura.fechaFactura).toLocaleDateString('es-CO')}</span>
                      </p>
                      <p className="mb-0 small text-muted">
                        <i className="bi bi-wallet-fill me-1"></i>
                        Método de Pago: <span className="fw-semibold text-dark">{order.factura.metodoPago || 'N/A'}</span>
                      </p>
                       {order.factura.totalFactura && ( /* Solo muestra si totalFactura existe */
                         <p className="mb-0 small text-muted">
                            <i className="bi bi-currency-dollar me-1"></i>
                            Total Factura: <span className="fw-semibold text-dark">${order.factura.totalFactura.toLocaleString('es-CO') || '0.00'}</span>
                         </p>
                       )}
                    </div>
                  )}
                </div>

                {/* Botón para ver detalles completos del pedido */}
                <div className="card-footer bg-light text-end py-3 rounded-bottom-lg">
                  <button
                    onClick={() => handleViewOrderDetails(order.idPedido)}
                    className="btn btn-outline-primary rounded-pill fw-semibold" // Estilos de botón Bootstrap
                  >
                    <i className="bi bi-eye-fill me-2"></i> Ver Detalles Completos
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Footer del sitio */}
      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default HistoryPage;


