// src/pages/admin/Dashboard.js

import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'; // Importa axios (asume que está configurado con tu baseURL)

// Si no usas axiosConfig, puedes definir la URL base aquí o en un .env
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalVentas: 0,
    totalPedidos: 0,
    totalClientes: 0,
    productosBajoStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token'); // Asegúrate de obtener el token
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        };

        // Realiza múltiples llamadas a la API para obtener cada estadística
        // O idealmente, un solo endpoint en el backend que devuelva todas las estadísticas
        const [
          salesResponse,
          ordersResponse,
          customersResponse,
          lowStockResponse
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/dashboard/total-ventas`, config),
          axios.get(`${API_BASE_URL}/admin/dashboard/total-pedidos`, config),
          axios.get(`${API_BASE_URL}/admin/dashboard/total-clientes`, config),
          axios.get(`${API_BASE_URL}/admin/dashboard/productos-bajo-stock`, config),
        ]);

        setDashboardData({
          totalVentas: salesResponse.data.data.totalVentas || 0,
          totalPedidos: ordersResponse.data.data.totalPedidos || 0,
          totalClientes: customersResponse.data.data.totalClientes || 0,
          productosBajoStock: lowStockResponse.data.data.productosBajoStock || 0,
        });

      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        setError(err.response?.data?.message || "Error al cargar las estadísticas del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Renderizado de estados de carga y error ---
  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando dashboard...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Preparando el panel de administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> Error: {error}
        </div>
        <button onClick={() => window.location.reload()} className="btn btn-outline-primary mt-3">
          <i className="bi bi-arrow-clockwise me-2"></i> Reintentar Carga
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-speedometer2 me-3"></i>Panel de Administración
      </h1>

      <div className="row g-4 justify-content-center"> {/* g-4 para espaciado entre columnas, justify-content-center */}
        {/* Tarjeta: Total Ventas */}
        <div className="col-md-6 col-lg-3"> {/* Responsive columns */}
          <div className="card text-white bg-primary mb-3 shadow-lg rounded-3 dashboard-card-hover"> {/* shadow-lg, rounded-3, hover effect */}
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title fw-bold mb-2">Total Ventas</h5>
                <p className="card-text fs-3 fw-bolder">${dashboardData.totalVentas.toLocaleString('es-CO')}</p> {/* Formato de moneda */}
              </div>
              <i className="bi bi-currency-dollar display-4 opacity-75"></i> {/* Icono grande */}
            </div>
          </div>
        </div>

        {/* Tarjeta: Total Pedidos */}
        <div className="col-md-6 col-lg-3">
          <div className="card text-white bg-success mb-3 shadow-lg rounded-3 dashboard-card-hover">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title fw-bold mb-2">Pedidos Totales</h5>
                <p className="card-text fs-3 fw-bolder">{dashboardData.totalPedidos.toLocaleString('es-CO')}</p>
              </div>
              <i className="bi bi-box-seam-fill display-4 opacity-75"></i>
            </div>
            <div className="card-footer bg-success-dark border-0 text-end py-2 px-3 small rounded-bottom-3">
                <a href="/admin/pedidos" className="text-white text-decoration-none">Gestionar Pedidos <i className="bi bi-arrow-right-circle-fill ms-1"></i></a>
            </div>
          </div>
        </div>

        {/* Tarjeta: Total Clientes */}
        <div className="col-md-6 col-lg-3">
          <div className="card text-white bg-info mb-3 shadow-lg rounded-3 dashboard-card-hover"> {/* Cambiado a bg-info */}
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title fw-bold mb-2">Clientes Registrados</h5>
                <p className="card-text fs-3 fw-bolder">{dashboardData.totalClientes.toLocaleString('es-CO')}</p>
              </div>
              <i className="bi bi-people-fill display-4 opacity-75"></i>
            </div>
            <div className="card-footer bg-info-dark border-0 text-end py-2 px-3 small rounded-bottom-3">
                <a href="/admin/usuarios/cliente" className="text-white text-decoration-none">Ver Clientes <i className="bi bi-arrow-right-circle-fill ms-1"></i></a>
            </div>
          </div>
        </div>

        {/* Tarjeta: Productos con Stock Bajo */}
        <div className="col-md-6 col-lg-3">
          <div className="card text-white bg-danger mb-3 shadow-lg rounded-3 dashboard-card-hover">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title fw-bold mb-2">Stock Bajo</h5>
                <p className="card-text fs-3 fw-bolder">{dashboardData.productosBajoStock.toLocaleString('es-CO')}</p>
              </div>
              <i className="bi bi-exclamation-triangle-fill display-4 opacity-75"></i>
            </div>
            <div className="card-footer bg-danger-dark border-0 text-end py-2 px-3 small rounded-bottom-3">
                <a href="/admin/productos-stock-bajo" className="text-white text-decoration-none">Revisar Productos <i className="bi bi-arrow-right-circle-fill ms-1"></i></a>
            </div>
          </div>
        </div>
      </div>


      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
