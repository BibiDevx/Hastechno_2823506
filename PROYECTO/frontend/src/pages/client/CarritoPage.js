// src/components/CarritoPage.js (o Checkout.js en tu proyecto)
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// Importamos las acciones asíncronas (thunks)
import {
  fetchCartItems,
  updateCartItem,
  removeCartItem,
  clearAllCartItems,
} from "../../redux/cartSlice"; // Asegúrate de que la ruta sea correcta

import { Modal, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

const CarritoPage = () => { // Renombrado a CarritoPage para consistencia
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.carrito.items);
  const cartStatus = useSelector((state) => state.carrito.status);
  const cartError = useSelector((state) => state.carrito.error);
  
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Del authSlice
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null); // Ahora guarda el idCarrito para eliminar

  // Cargar el carrito desde el backend al montar el componente
  useEffect(() => {
    // Solo si el estado no está ya cargando o ya se cargó con éxito
    // y si el carrito está vacío (para evitar recargas innecesarias)
    if (cartStatus === 'idle' && cartItems.length === 0) {
      dispatch(fetchCartItems());
    }
  }, [cartStatus, cartItems.length, dispatch]); // Dependencias

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 0) return; // No permitir cantidades negativas

    // Despacha la acción asíncrona updateCartItem
    dispatch(updateCartItem({ idCarrito: item.idCarrito, cantidad: newQuantity }));
  };

  const removeProductConfirmed = () => {
    // Despacha la acción asíncrona removeCartItem
    dispatch(removeCartItem(productToDeleteId));
    setShowModal(false);
    setProductToDeleteId(null);
  };

  const handleClearCart = () => {
    if (window.confirm("¿Estás seguro de que quieres vaciar todo el carrito?")) {
      dispatch(clearAllCartItems());
    }
  };

  const total = cartItems.reduce((sum, item) => 
    sum + (item.producto?.valorProducto || 0) * (item.cantidad || 0)
  , 0);

  const handleRealizarPago = () => {
    if (isAuthenticated) {
      navigate('/CheckoutPage'); // Redirige a la página de pago
    } else {
      navigate('/login'); // Redirige a login si no está autenticado
    }
  };

  // Renderizado condicional para estados de carga y error globales del carrito
  if (cartStatus === 'loading' && cartItems.length === 0 && !cartError) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando carrito...</span>
        </div>
        <p className="mt-2">Cargando carrito...</p>
      </div>
    );
  }

  if (cartStatus === 'failed' && cartItems.length === 0) { // Mostrar error solo si el carrito no se cargó
    return (
      <div className="container mt-5 alert alert-danger" role="alert">
        Error al cargar el carrito: {cartError}
        {/* Aquí podrías añadir un botón para reintentar */}
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 fw-bold text-primary">Resumen de tu Carrito</h2>

      {cartError && ( // Muestra errores de operaciones individuales (añadir, actualizar, eliminar)
        <div className="alert alert-danger mb-3" role="alert">
          Error: {cartError}
        </div>
      )}

      <div className="table-responsive rounded-lg shadow-sm">
        <table className="table table-hover bg-white">
          <thead className="bg-light">
            <tr>
              <th>Producto</th>
              <th>Nombre</th>
              <th>Precio Unitario</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">Tu carrito está vacío.</td></tr>
            ) : (
              cartItems.map(item => (
                <tr key={item.idCarrito}> 
                  <td>
                    <img
                      src={`/assets/img/productos/${item.idProducto}/principal.png`}  
                      alt={item.producto?.nombreProducto}
                      className="img-thumbnail rounded"
                      style={{ width: 70, height: 70, objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null; 
                      }}
                    />
                  </td>
                  <td className="align-middle fw-semibold">{item.producto?.nombreProducto || 'Producto Desconocido'}</td>
                  <td className="align-middle text-secondary">${(item.producto?.valorProducto || 0).toLocaleString()}</td>
                  <td className="align-middle">
                    <div className="input-group" style={{ width: 120 }}>
                      
                      <input
                        type="number"
                        min="1"
                        className="form-control text-center"
                        style={{ width: 80 }}
                        value={item.cantidad}
                        onChange={(e) => handleUpdateQuantity(item, parseInt(e.target.value))}
                        disabled={cartStatus === 'loading'}
                      />
                     
                    </div>
                  </td>
                  <td className="align-middle fw-semibold">${((item.producto?.valorProducto || 0) * (item.cantidad || 0)).toLocaleString()}</td>
                  <td className="align-middle">
                    <button
                      className="btn btn-outline-danger btn-sm rounded-pill"
                      onClick={() => { setProductToDeleteId(item.idCarrito); setShowModal(true); }}
                      disabled={cartStatus === 'loading'}
                    >
                      <i className="bi bi-trash-fill"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {cartItems.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="4" className="text-end fw-bold">Total:</td>
                <td className="fw-bold text-primary">${total.toLocaleString()}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan="6" className="text-end">
                  <Button
                    variant="success"
                    size="lg"
                    className="rounded-pill fw-semibold me-2"
                    onClick={handleClearCart}
                    disabled={cartStatus === 'loading' || cartItems.length === 0}
                  >
                    <i className="bi bi-x-circle-fill me-2"></i> Vaciar Carrito
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-pill fw-semibold"
                    onClick={handleRealizarPago}
                    disabled={cartStatus === 'loading' || cartItems.length === 0}
                  >
                    <i className="bi bi-credit-card-fill me-2"></i> Realizar Pago
                  </Button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Modal para eliminar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i> Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este producto del carrito?
        </Modal.Body>
        <Modal.Footer className="justify-content-end">
          <Button variant="secondary" className="rounded-pill fw-semibold" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button variant="danger" className="rounded-pill fw-semibold" onClick={removeProductConfirmed}>
            <i className="bi bi-trash-fill me-1"></i> Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CarritoPage;
