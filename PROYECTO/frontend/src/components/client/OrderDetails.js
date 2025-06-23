// src/pages/OrderDetailsPage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pedidoService from '../../services/pedidoService';

function OrderDetails() {
  const { id } = useParams(); // Obtiene el 'id' de la URL (ej. /mis-pedidos/123 -> id = "123")
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true); // Iniciar estado de carga
        const orderData = await pedidoService.getOrderById(id);
        setOrder(orderData); // Guardar los datos del pedido
        setError(null); // Limpiar errores previos
      } catch (err) {
        console.error('Error al cargar detalles del pedido:', err);
        setError(err.message || 'No se pudo cargar los detalles del pedido.');
        setOrder(null); // Asegurarse de que el pedido esté nulo en caso de error
        // Opcional: Si el error es 404 o 401, podrías redirigir
        // if (err.response?.status === 404 || err.response?.status === 401) {
        //   navigate('/mis-pedidos'); // Redirigir al historial si no se encuentra o no es autorizado
        // }
      } finally {
        setLoading(false); // Finalizar estado de carga
      }
    };

    fetchOrderDetails();
  }, [id, navigate]); // Dependencias: se ejecuta cuando el 'id' de la URL cambia

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Cargando detalles del pedido #{id}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={() => navigate('/mis-pedidos')} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
          Volver al historial de pedidos
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>No se encontró el pedido.</p>
        <button onClick={() => navigate('/mis-pedidos')} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
          Volver al historial de pedidos
        </button>
      </div>
    );
  }

  // Helper para calcular el total si no viene directamente en el objeto 'pedido'
  const calculateOrderTotal = (productos) => {
    return productos.reduce((sum, item) => sum + item.valorTotal, 0);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '35px', color: '#333' }}>Detalles del Pedido #{order.idPedido}</h1>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '15px', color: '#007bff' }}>Información General</h2>
        <p style={{ margin: '10px 0' }}><strong>Fecha del Pedido:</strong> {new Date(order.fechaPedido).toLocaleDateString()} {new Date(order.fechaPedido).toLocaleTimeString()}</p>
        {/* Aquí puedes añadir más detalles del pedido si los tienes en tu tabla 'pedido' */}
      </div>

      <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '15px', color: '#28a745' }}>Artículos Comprados</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {order.productos && order.productos.map((item) => (
            <li key={item.idProducto} style={{ borderBottom: '1px dashed #e9e9e9', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#555' }}>{item.producto?.nombreProducto || 'Producto Desconocido'}</strong>
                <p style={{ margin: '0', fontSize: '0.9em', color: '#777' }}>Cantidad: {item.cantidadProducto}</p>
              </div>
              <span style={{ fontWeight: 'bold', color: '#333' }}>${item.valorTotal.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p style={{ fontWeight: 'bold', fontSize: '1.6em', textAlign: 'right', marginTop: '25px', color: '#333' }}>
          Total del Pedido: ${calculateOrderTotal(order.productos).toFixed(2)}
        </p>
      </div>

      {order.factura && ( // Solo muestra los detalles de la factura si existe
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '1.5em', marginBottom: '15px', color: '#ffc107' }}>Detalles de la Factura</h2>
          <p style={{ margin: '10px 0' }}><strong>Fecha de Factura:</strong> {new Date(order.factura.fechaFactura).toLocaleDateString()}</p>
          <p style={{ margin: '10px 0' }}><strong>Método de Pago:</strong> {order.factura.metodoPago || 'N/A'}</p>
          {/* Aquí podrías añadir más detalles de la factura si los tuvieras (ej. dirección de facturación) */}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => navigate('/historial')}
          style={{ padding: '12px 25px', fontSize: '1em', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.2s' }}
        >
          Volver al Historial de Pedidos
        </button>
      </div>
    </div>
  );
}

export default OrderDetails;