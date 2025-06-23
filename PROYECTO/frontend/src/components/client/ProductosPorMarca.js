import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importa Link
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import productService from '../../services/productService'; // Importa el servicio

const ProductosPorMarca = () => {
  const { idMarca } = useParams();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nombreMarca, setNombreMarca] = useState(''); // Estado para el nombre de la marca
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProductosPorMarca = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productService.getProductsByBrand(idMarca);
        
        if (Array.isArray(data)) {
          setProductos(data);
          // Intentar obtener el nombre de la marca del primer producto (si existe)
          if (data.length > 0 && data[0].marca && data[0].marca.nombreMarca) {
            setNombreMarca(data[0].marca.nombreMarca);
          } else {
            // Si no hay productos o el nombre de la marca no está disponible, intenta buscarla por ID
            // Esto asume que tienes un servicio o endpoint para obtener la marca por ID
            try {
                const brandInfo = await productService.getBrandById(idMarca); // Necesitas implementar este método en productService
                if(brandInfo && brandInfo.nombreMarca) {
                    setNombreMarca(brandInfo.nombreMarca);
                } else {
                    setNombreMarca('Marca Desconocida');
                }
            } catch (brandErr) {
                console.error("Error al obtener nombre de la marca:", brandErr);
                setNombreMarca('Marca Desconocida');
            }
          }
        } else {
          console.error("Formato de datos inesperado de la API de productos por marca:", data);
          setError('Formato de datos inesperado al cargar productos por marca.');
          setProductos([]);
          setNombreMarca('Marca Desconocida');
        }
      } catch (err) {
        console.error("Error al cargar productos por marca:", err);
        setError('Error al cargar productos por marca: ' + (err.message || 'Error desconocido.'));
        setProductos([]);
        setNombreMarca('Marca Desconocida');
      } finally {
        setLoading(false);
      }
    };

    fetchProductosPorMarca();
  }, [idMarca]);

  const handleAddToCart = (producto) => {
    // Verificar stock antes de agregar al carrito
    if (producto.cantidadStock <= 0) {
        alert("Este producto está agotado y no se puede añadir al carrito.");
        return;
    }

    dispatch(
      addToCart({
        idProducto: producto.idProducto,
        nombreProducto: producto.nombreProducto,
        valorProducto: producto.valorProducto,
        cantidad: 1,
      })
    );
    console.log(`Producto "${producto.nombreProducto}" agregado al carrito.`);
    alert(`"${producto.nombreProducto}" agregado al carrito.`);
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
    return (
        <div className="container mt-5 text-center">
            <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
            </div>
        </div>
    );
  }

  const lowStockThreshold = 5; // Define el umbral para "pocas unidades"

  return (
    <div className="container mt-5 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-primary">
                Productos de {nombreMarca !== 'Marca Desconocida' ? nombreMarca : 'la Marca'}
            </h2>

        </div>
      
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4"> {/* Agregado row-cols-lg-4 para más columnas en pantallas grandes */}
        {Array.isArray(productos) && productos.length > 0 ? (
          productos.map((producto) => {
            const imagenUrl = `/assets/img/productos/${producto.idProducto}/principal.png`;
            const isAvailable = producto.cantidadStock > 0;
            const isLowStock = isAvailable && producto.cantidadStock <= lowStockThreshold;

            return (
              <div key={producto.idProducto} className="col">
                <div 
                    className="card shadow-sm text-center h-100 border-0 rounded-lg product-card-hover" 
                    style={{ transition: 'transform 0.2s ease-in-out' }}
                >
                  <div
                    className="bg-light d-flex align-items-center justify-content-center p-3 rounded-top-lg"
                    style={{ height: "220px", overflow: 'hidden' }}
                  >
                    <img
                      src={imagenUrl}
                      alt={producto.nombreProducto}
                      className="img-fluid"
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/200x200/e0e0e0/555555?text=No+Imagen`; // Placeholder más suave
                        console.warn(`Error al cargar imagen para producto ${producto.idProducto}: ${producto.nombreProducto}`);
                      }}
                    />
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between bg-white p-3">
                    <h5 className="card-title fw-bold text-truncate mb-2" style={{ fontSize: '1.15rem' }}>{producto.nombreProducto}</h5>
                    <p className="card-text fw-bolder text-primary mb-3" style={{ fontSize: '1.35rem' }}>
                      ${(producto.valorProducto || 0).toLocaleString('es-CO')}
                    </p>
                    
                    {/* --- Mostrar cantidad de stock --- */}
                    {producto.cantidadStock !== undefined && producto.cantidadStock !== null ? (
                      <p className="card-text mb-3">
                        {isAvailable ? (
                          <span className={`badge ${isLowStock ? 'bg-secondary-subtle text-secondary' : 'bg-success-subtle text-success'} fs-6 py-2 px-3`}>
                            <i className="bi bi-box-seam me-2"></i> {isLowStock ? `Pocas unidades (${producto.cantidadStock})` : `${producto.cantidadStock} en stock`}
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger fs-6 py-2 px-3">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i> Agotado
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="card-text mb-3">
                        <span className="badge bg-secondary-subtle text-secondary fs-6 py-2 px-3">
                          <i className="bi bi-question-circle-fill me-2"></i> Stock: N/A
                        </span>
                      </p>
                    )}
                    {/* ---------------------------------- */}

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
            <p className="fs-5"><i className="bi bi-box-seam me-2"></i> No hay productos disponibles para esta marca en este momento.</p>
          </div>
        )}
      </div>

       {/* Footer */}
       <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default ProductosPorMarca;