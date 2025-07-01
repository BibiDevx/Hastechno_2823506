// src/pages/admin/ProductosBajoStock.js

import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import productService from "../../services/productService"; // Asegúrate de que esta ruta sea correcta
import { useNavigate } from 'react-router-dom';

export default function ProductosBajoStock() {
  const navigate = useNavigate();
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Asumiendo que productService tiene un método para obtener productos con stock bajo.
        // Si no lo tienes, podrías adaptar esto para filtrar de 'getAllProductsWithDetailsForAdmin()'
        // Ejemplo: const allProducts = await productService.getAllProductsWithDetailsForAdmin();
        // const lowStock = allProducts.filter(p => p.cantidadStock <= 5); // Define tu umbral de stock bajo
        // setProductosBajoStock(lowStock);

        // Idealmente, tu backend debería tener un endpoint para esto:
        const response = await productService.getLowStockProducts(); // Asume que este método existe
        
        if (Array.isArray(response)) {
          setProductosBajoStock(response);
        } else {
          console.error("La API no devolvió una lista de productos bajo stock válida. Datos recibidos:", response);
          setError("La API no devolvió una lista de productos bajo stock válida.");
          setProductosBajoStock([]);
        }
      } catch (err) {
        console.error("Error al cargar productos con stock bajo:", err);
        setError(err.message || "Error al cargar los productos con stock bajo.");
        setProductosBajoStock([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando productos con stock bajo...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Obteniendo la lista de productos que necesitan reabastecimiento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="alert alert-danger animated fadeIn" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> Error: {error}
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-outline-primary mt-3 rounded-pill fw-semibold">
          <i className="bi bi-arrow-left-circle-fill me-2"></i> Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-danger">
        <i className="bi bi-exclamation-octagon-fill me-3"></i>Productos con Stock Bajo
      </h1>

      <p className="lead text-center mb-4">
        A continuación, se muestran los productos que requieren atención para su reabastecimiento.
      </p>

      <div className="d-flex justify-content-end mb-3">
        <button 
          className="btn btn-secondary rounded-pill fw-semibold shadow-sm" 
          onClick={() => navigate('/admin/productos')}
        >
          <i className="bi bi-box-seam-fill me-2"></i> Ir a Gestión de Productos
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded-lg"> 
        <table className="table table-hover table-striped align-middle"> 
          <thead className="table-dark"> 
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre del Producto</th>
              <th scope="col">Stock Actual</th>
              <th scope="col">Disponibilidad</th>
              <th scope="col">Marca</th>
              <th scope="col">Proveedor</th>
              <th scope="col" className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(productosBajoStock) && productosBajoStock.length > 0 ? (
              productosBajoStock.map((product) => (
                <tr key={product.idProducto}>
                  <td className="fw-bold">{product.idProducto}</td>
                  <td>{product.nombreProducto}</td>
                  <td>
                    <span className="badge bg-warning text-dark py-2 px-3 rounded-pill">
                      {product.cantidadStock || 0} unidades
                    </span>
                  </td>
                  <td>
                    {product.disponibilidad ? 
                      <span className="badge bg-success py-2 px-3 rounded-pill">Disponible</span> : 
                      <span className="badge bg-danger py-2 px-3 rounded-pill">Agotado</span>
                    }
                  </td>
                  <td>{product.marca?.nombreMarca || "N/A"}</td> 
                  <td>{product.proveedor?.nombreProveedor || "N/A"}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill fw-semibold"
                      onClick={() => navigate(`/admin/productos`)} // Podrías enlazar a la edición directa si tu ruta lo permite
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Gestionar Producto
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted fs-5"> 
                  ¡Excelente! No hay productos con stock bajo en este momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
