import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Carousel } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import { Link } from "react-router-dom";
import productService from '../../services/productService'; // Importa el servicio

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const imagePath = `/assets/img/productos/${product.idProducto}/principal.png`;

  const isAvailable = product.cantidadStock > 0;

  const handleAddToCart = () => {
    if (isAvailable) {
      dispatch(
        addToCart({
          idProducto: product.idProducto,
          nombreProducto: product.nombreProducto,
          valorProducto: product.valorProducto,
          cantidad: 1,
        })
      );
      console.log(
        `Producto "${product.nombreProducto}" (ID: ${product.idProducto}) agregado al carrito desde la Home.`
      );
      alert(`"${product.nombreProducto}" agregado al carrito.`);
    } else {
      alert("Este producto está agotado.");
    }
  };

  return (
    <div className="col">
      <div 
        className="card shadow-sm text-center h-100 border-0 rounded-lg product-card-hover" // Agregado product-card-hover
        style={{ transition: 'transform 0.2s ease-in-out' }} // Transición para el hover
      >
        <div
          className="bg-light d-flex align-items-center justify-content-center p-3 rounded-top-lg"
          style={{ height: "220px", overflow: 'hidden' }} // overflow:hidden para imágenes grandes
        >
          <img
            src={imagePath}
            alt={product.nombreProducto}
            className="img-fluid"
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/200x200/e0e0e0/555555?text=No+Imagen`; // Placeholder más suave
              console.warn(`Error al cargar imagen para producto ${product.idProducto}: ${product.nombreProducto}`);
            }}
          />
        </div>
        <div className="card-body d-flex flex-column justify-content-between bg-white p-3">
          <h5 className="card-title fw-bold text-truncate mb-2" style={{ fontSize: '1.15rem' }}>{product.nombreProducto}</h5> {/* Tamaño de fuente ajustado */}
          <p className="card-text fw-bolder text-primary mb-3" style={{ fontSize: '1.35rem' }}> {/* Fuente más grande y negrita */}
            ${product.valorProducto.toLocaleString('es-CO')}
          </p>
          
          {/* --- Mejora visual para la cantidad de stock --- */}
          {product.cantidadStock !== undefined && product.cantidadStock !== null ? (
            <p className="card-text mb-3"> {/* Margin-bottom añadido */}
              {product.cantidadStock > 0 ? (
                <span className="badge bg-success-subtle text-success fs-6 py-2 px-3"> {/* Badge de Bootstrap */}
                  <i className="bi bi-box-seam me-2"></i> {product.cantidadStock} en stock
                </span>
              ) : (
                <span className="badge bg-danger-subtle text-danger fs-6 py-2 px-3"> {/* Badge para agotado */}
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Agotado
                </span>
              )}
            </p>
          ) : (
            <p className="card-text mb-3">
              <span className="badge bg-warning-subtle text-warning fs-6 py-2 px-3">
                <i className="bi bi-question-circle-fill me-2"></i> Stock: No disponible
              </span>
            </p>
          )}
          {/* -------------------------------------------------------- */}

          <div className="mt-auto d-flex justify-content-center gap-2"> {/* mt-auto para empujar hacia abajo */}
            <Link
              to={`/info/${product.idProducto}`}
              className="btn btn-outline-info btn-sm rounded-pill fw-semibold flex-grow-1" // flex-grow-1 para que ocupe espacio
            >
              <i className="bi bi-info-circle-fill me-1"></i> Detalles
            </Link>
            <button
              className={`btn btn-sm rounded-pill fw-semibold flex-grow-1 ${isAvailable ? 'btn-primary' : 'btn-secondary'}`} // Cambia color si agotado
              onClick={handleAddToCart}
              disabled={!isAvailable} 
            >
              <i className="bi bi-cart-plus-fill me-1"></i> {isAvailable ? 'Agregar' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [productosRecientes, setProductosRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productService.getHomeProducts();
        
        if (Array.isArray(data)) {
          setProductosRecientes(data);
        } else {
          console.error("Formato de datos inesperado de la API de productos recientes:", data);
          setError('Formato de datos inesperado al cargar productos.');
          setProductosRecientes([]);
        }
      } catch (err) {
        console.error("Error al cargar los productos recientes:", err);
        setError('Error al cargar los productos recientes: ' + (err.message || 'Error desconocido.'));
        setProductosRecientes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </div>
        <p className="mt-2 text-muted">Cargando productos recientes...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center mt-5 alert alert-danger">{error}</p>;
  }

  return (
    <div>
      {/* Slider */}
      <Carousel className="mt-3 shadow-sm" interval={5000} style={{ maxHeight: "400px", overflow: "hidden" }}>
        <Carousel.Item style={{ height: "400px" }}>
          <img
            className="d-block w-100 h-100 object-fit-cover"
            src="/assets/img/banner/banner1.png"
            alt="Oferta 1"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/800x400/e0e0e0/555555?text=Banner+1`; }}
          />
        </Carousel.Item>
        <Carousel.Item style={{ height: "400px" }}>
          <img
            className="d-block w-100 h-100 object-fit-cover"
            src="/assets/img/banner/banner2.png"
            alt="Oferta 2"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/800x400/e0e0e0/555555?text=Banner+2`; }}
          />
          <Carousel.Caption className="bg-dark bg-opacity-75 rounded p-2">
            <h3 className="fw-bold text-warning">Procesadores de Última Generación</h3>
            <p className="mb-0">Consigue los nuevos Ryzen e Intel.</p>
          </Carousel.Caption>
        </Carousel.Item>
        {/* Puedes añadir más Carousel.Item aquí */}
      </Carousel>

      {/* Productos Nuevos */}
      <div className="container mt-5">
        <h2 className="text-center mb-4 fw-bold text-primary">Nuevos Productos</h2>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {productosRecientes.length > 0 ? (
            productosRecientes.map((product) => (
              <ProductCard key={product.idProducto} product={product} />
            ))
          ) : (
            <p className="text-center text-muted col-12">No hay productos recientes disponibles.</p>
          )}
        </div>
      </div>

      {/* Novedades del Mundo Tech */}
      <div className="container mt-5">
        <h2 className="text-center mb-4 fw-bold text-secondary">Novedades del Mundo Tech</h2>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          <div className="col">
            <div className="card h-100 shadow-sm border-0 rounded-lg">
              <img
                src="/assets/img/novedad/noticia1.png"
                className="card-img-top rounded-top-lg"
                alt="Noticia 1"
                style={{ height: "200px", objectFit: "cover" }}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x200/e0e0e0/555555?text=Noticia+1`; }}
              />
              <div className="card-body p-3">
                <h5 className="card-title fw-semibold text-secondary">NVIDIA lanza nueva RTX 5090</h5>
                <p className="card-text small text-muted">
                  La nueva generación promete duplicar el rendimiento respecto a la 4090.
                </p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card h-100 shadow-sm border-0 rounded-lg">
              <img
                src="/assets/img/novedad/noticia2.png"
                className="card-img-top rounded-top-lg"
                alt="Noticia 2"
                style={{ height: "200px", objectFit: "cover" }}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x200/e0e0e0/555555?text=Noticia+2`; }}
              />
              <div className="card-body p-3">
                <h5 className="card-title fw-semibold text-secondary">AMD presenta Ryzen 9000</h5>
                <p className="card-text small text-muted">
                  Con una arquitectura mejorada y consumo energético más eficiente.
                </p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card h-100 shadow-sm border-0 rounded-lg">
              <img
                src="/assets/img/novedad/noticia3.png"
                className="card-img-top rounded-top-lg"
                alt="Noticia 3"
                style={{ height: "200px", objectFit: "cover" }}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x200/e0e0e0/555555?text=Noticia+3`; }}
              />
              <div className="card-body p-3">
                <h5 className="card-title fw-semibold text-secondary">Intel apuesta por chips híbridos</h5>
                <p className="card-text small text-muted">
                  Los nuevos procesadores fusionan eficiencia y potencia para laptops.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default HomePage;