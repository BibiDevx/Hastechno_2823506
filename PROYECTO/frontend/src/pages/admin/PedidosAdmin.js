// src/pages/admin/PedidosAdmin.js

import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import pedidoService from '../../services/pedidoService'; // 

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar todos los pedidos desde la API usando pedidoService
  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Usa la nueva función getAdminOrders del servicio
      const data = await pedidoService.getAdminOrders(); 
      setPedidos(data);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      setError(err.message || "Error al cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos(); // Carga los pedidos al montar el componente
  }, []);

  // Función para mostrar los detalles del pedido en el modal
  const handleShowDetails = (pedido) => {
    setSelectedPedido(pedido);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setSelectedPedido(null);
  };

  // Función auxiliar para calcular el total del pedido.
  // Asume que `item.valorTotal` ya es el valor total por ítem (precio * cantidad).
  // @param {Array} productos - Array de objetos PedidoProducto.
  // @returns {number} El total del pedido.
  const calculateOrderTotal = (productos) => {
    // Verifica si productos es un array antes de reducir
    if (!Array.isArray(productos)) {
        return 0;
    }
    return productos.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
  };

  // --- Renderizado de estados de carga y error ---
  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando pedidos...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando lista de pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> Error: {error}
        </div>
        <button onClick={fetchPedidos} className="btn btn-outline-primary mt-3">
          <i className="bi bi-arrow-clockwise me-2"></i> Reintentar Carga
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-center mb-4 fw-bold text-primary">
        <i className="bi bi-box-seam-fill me-3"></i>Administrar Pedidos
      </h1>

      {pedidos.length === 0 ? (
        <div className="alert alert-info text-center py-4" role="alert">
          <i className="bi bi-info-circle-fill me-2 fs-4"></i>
          <p className="mb-0 fs-5">No hay pedidos registrados en el sistema.</p>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded-lg"> 
          <table className="table table-hover table-striped align-middle"> 
            <thead className="table-dark"> 
              <tr>
                <th scope="col">ID Pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Fecha</th>
                <th scope="col">Total</th>
                <th scope="col">Acciones</th> 
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.idPedido}> 
                  <td className="fw-bold">{pedido.idPedido}</td>
                  <td>{pedido.cliente?.nombreCliente || 'N/A'} {pedido.cliente?.apellidoCliente || ''}</td> 
                  <td>{new Date(pedido.fechaPedido).toLocaleDateString('es-CO')}</td>
                  <td className="fw-bold text-primary">${(pedido.productos?.reduce((sum, item) => sum + (item.valorTotal || 0), 0) || 0).toLocaleString('es-CO')}</td>
                  <td>
                    <button
                      className="btn btn-outline-info btn-sm rounded-pill" 
                      onClick={() => handleShowDetails(pedido)}
                    >
                      <i className="bi bi-eye-fill me-1"></i> Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalles del Pedido */}
      {selectedPedido && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> {/* Centrado y tamaño grande */}
            <div className="modal-content rounded-lg shadow-lg"> {/* Redondeado y sombra */}
              <div className="modal-header bg-primary text-white rounded-top-lg"> {/* Encabezado con color */}
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-receipt-cutoff me-2"></i>Detalles del Pedido #{selectedPedido.idPedido}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body p-4">
                {/* Información General */}
                <h6 className="fw-semibold text-primary mb-3">Información General:</h6>
                <p className="mb-1"><strong><i className="bi bi-person-fill me-2"></i>Cliente:</strong> {selectedPedido.cliente?.nombreCliente || 'N/A'} {selectedPedido.cliente?.apellidoCliente || ''}</p>
                <p className="mb-1"><strong><i className="bi bi-calendar-event me-2"></i>Fecha del Pedido:</strong> {new Date(selectedPedido.fechaPedido).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                
                {/* Detalles de la Factura (si existe) */}
                {selectedPedido.factura && (
                  <div className="mt-4 pt-3 border-top border-dashed">
                    <h6 className="fw-semibold text-info mb-3">Detalles de Factura:</h6>
                    <p className="mb-1"><strong><i className="bi bi-receipt-cutoff me-2"></i>Número Factura:</strong> {selectedPedido.factura.numeroFactura || 'N/A'}</p>
                    <p className="mb-1"><strong><i className="bi bi-calendar-check me-2"></i>Fecha Factura:</strong> {new Date(selectedPedido.factura.fechaFactura).toLocaleDateString('es-CO')}</p>
                    <p className="mb-1"><strong><i className="bi bi-wallet-fill me-2"></i>Método de Pago:</strong> {selectedPedido.factura.metodoPago || 'N/A'}</p>
                    {selectedPedido.factura.totalFactura && (
                       <p className="mb-1"><strong><i className="bi bi-currency-dollar me-2"></i>Total Factura:</strong> ${selectedPedido.factura.totalFactura.toLocaleString('es-CO')}</p>
                    )}
                  </div>
                )}

                {/* Artículos del Pedido */}
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-semibold text-success mb-3">Artículos Comprados:</h6>
                  <ul className="list-group list-group-flush mb-3">
                    {Array.isArray(selectedPedido.productos) && selectedPedido.productos.length > 0 ? (
                      selectedPedido.productos.map(item => (
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
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <h5 className="mb-0 fw-bold">Total del Pedido:</h5>
                    <h5 className="mb-0 fw-bold text-primary">${calculateOrderTotal(selectedPedido.productos).toLocaleString('es-CO')}</h5>
                  </div>
                </div>
              </div>
              <div className="modal-footer rounded-bottom-lg">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary rounded-pill" 
                  onClick={handleCloseModal}
                >
                  <i className="bi bi-x-circle-fill me-2"></i>Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer del sitio */}
      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
