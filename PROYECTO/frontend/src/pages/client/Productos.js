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

  const handleAddToCart = () => {
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
      <div className="card shadow-sm h-100 border-0 rounded-lg"> {/* Añadido rounded-lg */}
        <div className="bg-light d-flex align-items-center justify-content-center p-3 rounded-top-lg" style={{ height: "220px" }}> {/* Añadido rounded-top-lg */}
          <img
            src={imagePath}
            alt={product.nombreProducto}
            className="img-fluid p-2"
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
            onError={(e) => {
              e.target.onerror = null; // Previene bucles infinitos
              e.target.src = `https://placehold.co/200x200/cccccc/000000?text=No+Imagen`; // Placeholder
              console.warn(`Error al cargar imagen para producto ${product.idProducto}: ${product.nombreProducto}`);
            }}
          />
        </div>
        <div className="card-body d-flex flex-column justify-content-between bg-white p-3">
          <h5 className="card-title fw-bold text-truncate">{product.nombreProducto}</h5>
          <p className="card-text fw-bold text-primary">${(product.valorProducto || 0).toLocaleString('es-CO')}</p> {/* Formato de moneda, text-primary */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Link
              to={`/info/${product.idProducto}`}
              className="btn btn-outline-info btn-sm rounded-pill fw-semibold" // rounded-pill, fw-semibold
            >
              <i className="bi bi-info-circle-fill me-1"></i> Info
            </Link>
            <button
              className="btn btn-primary btn-sm rounded-pill fw-semibold" // rounded-pill, fw-semibold
              onClick={handleAddToCart}
            >
              <i className="bi bi-cart-plus-fill me-1"></i> Agregar
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
      setError(''); // Limpiar errores antes de cada intento
      try {
        // ✅ CORRECCIÓN CLAVE: productService.getAllAvailableProducts() ahora devuelve directamente el array
        const data = await productService.getAllAvailableProducts();
        
        if (Array.isArray(data)) { // Verifica si la respuesta es un array
          setProducts(data);
        } else {
          console.error("Formato de datos inesperado de la API de productos:", data);
          setError('Formato de datos inesperado al cargar productos.');
          setProducts([]); // Asegurar que sea un array vacío
        }
      } catch (err) {
        console.error("Error al cargar productos:", err);
        // El mensaje de error ya debería venir formateado desde el servicio
        setError('Error al cargar productos: ' + (err.message || 'Error desconocido.'));
        setProducts([]); // Limpiar en caso de error
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
          // Asegúrate de que 'product.categorias' sea un array antes de usar .some()
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
    return <div className="container mt-4 alert alert-danger text-center">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Filtros */}
        <div className="col-md-3 mb-4">
          <h5 className="fw-bold text-secondary mb-3">Filtrar por Categoría</h5> {/* text-secondary */}
          <ul className="list-group shadow-sm rounded"> {/* shadow-sm, rounded */}
            {categories.map((category) => (
              <li
                key={category}
                className={`list-group-item list-group-item-action ${
                  selectedCategory === category ? "active fw-bold" : "" // fw-bold para activo
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
          <h2 className="mb-4 fw-bold text-primary"> {/* text-primary */}
            {selectedCategory === "TODOS" ? "Todos los Productos" : selectedCategory}
          </h2>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.idProducto} product={product} />
              ))
            ) : (
              <div className="col-12 text-center text-muted py-5"> {/* py-5 para centrar verticalmente */}
                <p>No hay productos disponibles en esta categoría.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
