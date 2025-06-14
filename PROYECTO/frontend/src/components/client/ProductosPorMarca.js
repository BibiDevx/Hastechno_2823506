import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import productService from '../../services/productService'; // Importa el servicio

const ProductosPorMarca = () => {
  const { idMarca } = useParams();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProductosPorMarca = async () => {
      setLoading(true);
      setError(''); // Limpiar errores antes de cada intento
      try {
        // ✅ CORRECCIÓN CLAVE: productService.getProductsByBrand() ahora devuelve directamente el array
        const data = await productService.getProductsByBrand(idMarca);
        
        if (Array.isArray(data)) { // Verifica si la respuesta es un array
          setProductos(data);
        } else {
          console.error("Formato de datos inesperado de la API de productos por marca:", data);
          setError('Formato de datos inesperado al cargar productos por marca.');
          setProductos([]); // Asegurar que sea un array vacío
        }
      } catch (err) {
        console.error("Error al cargar productos por marca:", err);
        // El mensaje de error ya debería venir formateado desde el servicio
        setError('Error al cargar productos por marca: ' + (err.message || 'Error desconocido.'));
        setProductos([]); // Limpiar en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchProductosPorMarca();
  }, [idMarca]); // Dependencia de idMarca para recargar si cambia

  const handleAddToCart = (producto) => {
    dispatch(
      addToCart({
        idProducto: producto.idProducto,
        nombreProducto: producto.nombreProducto,
        valorProducto: producto.valorProducto,
        cantidad: 1,
      })
    );
    console.log(`Producto "${producto.nombreProducto}" agregado al carrito.`);
    alert(`"${producto.nombreProducto}" agregado al carrito.`); // Pequeño feedback visual
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </div>
        <p className="mt-2 text-muted">Cargando productos de la marca...</p>
      </div>
    );
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger text-center">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 fw-bold text-primary">Productos de la Marca</h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {Array.isArray(productos) && productos.length > 0 ? (
          productos.map((producto) => {
            const imagenUrl = `/assets/img/productos/${producto.idProducto}/principal.png`;
            return (
              <div key={producto.idProducto} className="col">
                <div className="card h-100 shadow-sm border-0 rounded-lg"> {/* shadow-sm, border-0, rounded-lg */}
                  <div className="bg-light d-flex align-items-center justify-content-center p-3 rounded-top-lg" style={{ height: "220px" }}> {/* rounded-top-lg */}
                    <img
                      src={imagenUrl}
                      alt={producto.nombreProducto}
                      className="img-fluid p-2"
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        console.warn(`Error al cargar imagen para producto ${producto.idProducto}: ${producto.nombreProducto}`);
                      }}
                    />
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between bg-white p-3">
                    <div>
                      <h5 className="card-title fw-bold text-truncate">{producto.nombreProducto}</h5>
                      <p className="card-text fw-bold mb-0 text-primary">${(producto.valorProducto || 0).toLocaleString('es-CO')}</p> {/* fw-bold, text-primary */}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        className="btn btn-outline-info btn-sm rounded-pill fw-semibold" // rounded-pill, fw-semibold
                        onClick={() => navigate(`/info/${producto.idProducto}`)}
                      >
                        <i className="bi bi-info-circle-fill me-1"></i> Info
                      </button>
                      <button
                        className="btn btn-primary btn-sm rounded-pill fw-semibold" // rounded-pill, fw-semibold
                        onClick={() => handleAddToCart(producto)}
                      >
                        <i className="bi bi-cart-plus-fill me-1"></i> Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12 text-center text-muted py-5">
            <p>No hay productos disponibles para esta marca.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosPorMarca;
