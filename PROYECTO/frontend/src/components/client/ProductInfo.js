// src/components/ProductInfo.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Importa Link para el botón "Volver"
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import "bootstrap/dist/css/bootstrap.min.css";
// Asegúrate de importar los íconos de Bootstrap
import productService from '../../services/productService'; // Importa el servicio

const ProductInfo = () => {
  const { idProducto } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedProduct = await productService.getProductById(idProducto);
        
        if (fetchedProduct) { 
          setProducto(fetchedProduct);
        } else {
          setError('Producto no encontrado.');
          setProducto(null); 
        }
      } catch (err) {
        console.error("Error de red o API al obtener producto:", err);
        setError(err.message || 'Error de conexión con el servidor o al obtener el producto.');
        setProducto(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [idProducto]);

  // Usamos el `cantidadStock` directamente para determinar la disponibilidad
  const isAvailable = producto && producto.cantidadStock > 0;
  // Opcional: Define un umbral para "pocas unidades"
  const lowStockThreshold = 5; 
  const isLowStock = producto && producto.cantidadStock > 0 && producto.cantidadStock <= lowStockThreshold;


  const handleAddToCart = () => {
    if (!producto) {
      setError("No se puede agregar el producto al carrito. Información no disponible.");
      return;
    }

    if (!isAvailable) { // Usamos la variable isAvailable
      alert("Este producto no está disponible para añadir al carrito en este momento.");
      return;
    }

    dispatch(addToCart({ 
      idProducto: producto.idProducto, 
      nombreProducto: producto.nombreProducto, // Pasa el nombre y valor para el slice si es necesario
      valorProducto: producto.valorProducto, 
      cantidad: 1 // Asumimos que siempre se agrega 1 por defecto
    }))
      .unwrap() 
      .then(() => {
        alert(`"${producto.nombreProducto}" añadido al carrito.`);
        // Opcional: Podrías querer recargar el producto para actualizar el stock visible
        // fetchProductDetails(); 
      })
      .catch((err) => {
        console.error("Error al añadir al carrito:", err);
        alert(`No se pudo agregar "${producto.nombreProducto}" al carrito: ${err.message || 'Error desconocido.'}`);
      });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando información del producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
        </div>
        <Link to="/" className="btn btn-outline-primary mt-3">
            <i className="bi bi-arrow-left me-2"></i> Volver a la página principal
        </Link>
      </div>
    );
  }

  // Si no está cargando y no hay error, pero producto es null, significa que no se encontró
  if (!producto) {
    return (
      <div className="container mt-5 text-center">
        <p className="text-muted fs-5">
            <i className="bi bi-box-seam-fill me-2"></i> El producto solicitado no fue encontrado.
        </p>
        <Link to="/" className="btn btn-outline-primary mt-3">
            <i className="bi bi-arrow-left me-2"></i> Volver a la página principal
        </Link>
      </div>
    );
  }

  const imagePath = `/assets/img/productos/${producto.idProducto}/principal.png`;

  return (
    <div className="container mt-5 mb-5">
      <div className="row g-4"> {/* g-4 para un mejor espaciado entre columnas */}
        {/* Imagen del Producto */}
        <div className="col-md-6">
          <div className="bg-light d-flex align-items-center justify-content-center p-4 rounded-3 shadow-sm product-image-container"> {/* Aumentado padding y rounded-3 */}
            <img
              src={imagePath}
              alt={producto.nombreProducto}
              className="img-fluid"
              style={{ maxHeight: "450px", maxWidth: "100%", objectFit: "contain" }}
              onError={(e) => { 
                e.target.onerror = null;
                e.target.src = `https://placehold.co/400x300/e0e0e0/555555?text=No+Imagen+${producto.idProducto}`; // Placeholder más suave
                console.warn(`Error al cargar imagen para producto ${producto.idProducto}: ${producto.nombreProducto}`); 
              }}
            />
          </div>
        </div>

        {/* Información del Producto */}
        <div className="col-md-6 d-flex flex-column"> {/* flex-column para control de layout */}
          <h1 className="fw-bold mb-3 text-primary">{producto.nombreProducto}</h1> {/* Título más grande */}
          
          <div className="mb-3"> {/* Contenedor para detalles secundarios */}
            <p className="text-muted mb-1">
              **Marca:** <span className="fw-semibold text-dark">{producto.marca ? producto.marca.nombreMarca : "No disponible"}</span>
            </p>
            <p className="text-muted mb-1">
              **Categorías:**{" "}
              <span className="fw-semibold text-dark">
                {Array.isArray(producto.categorias) && producto.categorias.length > 0
                  ? producto.categorias.map((c) => c.nombreCategoria).join(", ")
                  : "No disponible"}
              </span>
            </p>
          </div>

          <p className="lead fw-bolder text-success mb-3" style={{ fontSize: '2.25rem' }}> {/* Precio más grande y llamativo */}
            ${(producto.valorProducto || 0).toLocaleString('es-CO')}
          </p>

          {/* Estado del Stock con Badges y Mensajes */}
          <div className="mb-4">
            {isAvailable ? (
              <p className="mb-0">
                <span className={`badge ${isLowStock ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'} fs-5 py-2 px-3`}>
                  <i className="bi bi-check-circle-fill me-2"></i> 
                  {isLowStock ? `¡Sólo ${producto.cantidadStock} unidades en stock!` : 'En stock'}
                </span>
              </p>
            ) : (
              <p className="mb-0">
                <span className="badge bg-danger-subtle text-danger fs-5 py-2 px-3">
                  <i className="bi bi-dash-circle-fill me-2"></i> Agotado temporalmente
                </span>
              </p>
            )}
          </div>
          {/* Fin del estado del stock */}

          <h4 className="fw-bold mb-2">Descripción del Producto</h4>
          <p className="mb-4 text-secondary product-description-scroll"> {/* Clase para scrollbar si es largo */}
            {producto.definicion || "No se ha proporcionado una descripción detallada para este producto."}
          </p>

          <div className="mt-auto d-flex flex-column flex-sm-row gap-3"> {/* Alinea al final y responsive */}
            {/* Botón de Agregar al carrito */}
            <button
              className={`btn ${isAvailable ? 'btn-primary' : 'btn-secondary'} btn-lg rounded-pill fw-semibold flex-grow-1`} 
              onClick={handleAddToCart}
              disabled={!isAvailable} 
            >
              <i className="bi bi-cart-plus-fill me-2"></i> {isAvailable ? 'Agregar al carrito' : 'Agotado'}
            </button>
            <Link to="/" className="btn btn-outline-secondary btn-lg rounded-pill fw-semibold flex-grow-1">
              <i className="bi bi-arrow-left me-2"></i> Seguir comprando
            </Link>
          </div>
        </div>
      </div>

       {/* Footer */}
       <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default ProductInfo;
