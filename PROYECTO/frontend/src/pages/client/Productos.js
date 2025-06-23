import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import productService from '../../services/productService'; // Importa el servicio

const categories = [
  "TODOS",
  "BOARDS",
  "TECLADOS",
  "MOUSE",
  "PERIFERICOS",
  "MONITORES",
  "FUENTES",
  "ALMACENAMIENTO",
  "PROCESADORES",
  "MEMORIA RAM",
  "AMD",
  "INTEL",
  "TARJETA GRAFICA",
  "DISIPADORES",
  "CHASIS",
  "DIADEMAS",
  "MICROFONOS",
  "CAMARAS",
  "VENTILADORES",
];

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const imagePath = `/assets/img/productos/${product.idProducto}/principal.png`;

  // Definir el umbral de stock bajo (pocas unidades)
  const lowStockThreshold = 5; 
  // Determinar la disponibilidad y si hay pocas unidades
  const isAvailable = product.cantidadStock > 0;
  const isLowStock = isAvailable && product.cantidadStock <= lowStockThreshold;

  const handleAddToCart = () => {
    // Verificar stock antes de agregar al carrito
    if (!isAvailable) {
      alert("Este producto está agotado y no se puede añadir al carrito.");
      return;
    }

    dispatch(
      addToCart({
        idProducto: product.idProducto,
        nombreProducto: product.nombreProducto,
        valorProducto: product.valorProducto,
        cantidad: 1,
      })
    );
    console.log(`Producto "${product.nombreProducto}" con ID ${product.idProducto} agregado al carrito.`);
    alert(`"${product.nombreProducto}" agregado al carrito.`); // Pequeño feedback visual
  };

  return (
    <div className="col">
      <div 
        className="card shadow-sm text-center h-100 border-0 rounded-lg product-card-hover" // Agregado product-card-hover
        style={{ transition: 'transform 0.2s ease-in-out' }} // Animación al pasar el mouse
      >
        <div className="bg-light d-flex align-items-center justify-content-center p-3 rounded-top-lg" style={{ height: "220px", overflow: 'hidden' }}>
          <img
            src={imagePath}
            alt={product.nombreProducto}
            className="img-fluid" // Eliminado p-2 para mayor control de espaciado
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/200x200/e0e0e0/555555?text=No+Imagen`; // Placeholder más suave
              console.warn(`Error al cargar imagen para producto ${product.idProducto}: ${product.nombreProducto}`);
            }}
          />
        </div>
        <div className="card-body d-flex flex-column justify-content-between bg-white p-3">
          <h5 className="card-title fw-bold text-truncate mb-2" style={{ fontSize: '1.15rem' }}>{product.nombreProducto}</h5> {/* Ajuste de tamaño de fuente */}
          <p className="card-text fw-bolder text-primary mb-3" style={{ fontSize: '1.35rem' }}> {/* Ajuste de tamaño de fuente y peso */}
            ${(product.valorProducto || 0).toLocaleString('es-CO')}
          </p>
          
          {/* --- Mostrar cantidad de stock con badges y lógica mejorada --- */}
          {product.cantidadStock !== undefined && product.cantidadStock !== null ? (
            <p className="card-text mb-3"> {/* mb-3 para un poco más de espacio */}
              {isAvailable ? (
                <span className={`badge ${isLowStock ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'} fs-6 py-2 px-3`}>
                  <i className="bi bi-box-seam me-2"></i> {isLowStock ? `Pocas unidades (${product.cantidadStock})` : `${product.cantidadStock} en stock`}
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
          {/* ----------------------------------------------------------- */}

          <div className="mt-auto d-flex justify-content-center gap-2"> {/* mt-auto para empujar hacia abajo */}
            <Link
              to={`/info/${product.idProducto}`}
              className="btn btn-outline-info btn-sm rounded-pill fw-semibold flex-grow-1" // flex-grow-1 para que ocupe espacio
            >
              <i className="bi bi-info-circle-fill me-1"></i> Detalles
            </Link>
            <button
              className={`btn btn-sm rounded-pill fw-semibold flex-grow-1 ${isAvailable ? 'btn-primary' : 'btn-secondary'}`} // Cambia clase si no está disponible
              onClick={handleAddToCart}
              disabled={!isAvailable} // Deshabilita el botón si no está disponible
            >
              <i className="bi bi-cart-plus-fill me-1"></i> {isAvailable ? 'Agregar' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductList = () => {
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productService.getAllAvailableProducts();
        
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Formato de datos inesperado de la API de productos:", data);
          setError('Formato de datos inesperado al cargar productos.');
          setProducts([]);
        }
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError('Error al cargar productos: ' + (err.message || 'Error desconocido.'));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "TODOS"
      ? products
      : products.filter((product) =>
          Array.isArray(product.categorias) && product.categorias.some(
            (categoria) => categoria.nombreCategoria === selectedCategory
          )
        );

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </div>
        <p className="mt-2 text-muted">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 text-center">
          <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
          </div>
      </div>
  );
  }

  return (
    <div className="container mt-4 mb-5"> {/* Añadido mb-5 para espacio con el footer */}
      <div className="row">
        {/* Filtros */}
        <div className="col-md-3 mb-4">
          <h5 className="fw-bold text-secondary mb-3">Filtrar por Categoría</h5>
          <ul className="list-group shadow-sm rounded">
            {categories.map((category) => (
              <li
                key={category}
                className={`list-group-item list-group-item-action ${
                  selectedCategory === category ? "active fw-bold" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
                style={{ cursor: "pointer" }}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>

        {/* Productos */}
        <div className="col-md-9">
          <h2 className="mb-4 fw-bold text-primary">
            {selectedCategory === "TODOS" ? "Todos nuestros Productos" : `Productos en ${selectedCategory}`} {/* Texto más descriptivo */}
          </h2>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4"> {/* Añadido row-cols-lg-4 */}
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.idProducto} product={product} />
              ))
            ) : (
              <div className="col-12 text-center text-muted py-5">
                <p className="fs-5"><i className="bi bi-box-seam me-2"></i> No hay productos disponibles en esta categoría.</p>
              </div>
            )}
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

export default ProductList;
