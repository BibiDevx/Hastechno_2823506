// src/components/ProductInfo.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice"; // Asegúrate de importar el THUNK addToCart
import "bootstrap/dist/css/bootstrap.min.css";
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
  }, [idProducto]); // Dependencia del ID del producto

  const handleAddToCart = () => {
    if (!producto) {
      setError("No se puede agregar el producto al carrito. Información no disponible.");
      return;
    }

    // ✅ CORRECCIÓN: Usamos directamente la propiedad booleana 'disponibilidad'
    // Asegúrate de que tu backend envía 'true' o 'false' para esta propiedad
    // O un número, en cuyo caso 'disponibilidad > 0' sería correcto.
    // Con este cambio, `true` -> disponible, `false`/`0`/`null`/`undefined` -> no disponible.
    if (!producto.disponibilidad) { // Si disponibilidad es false, 0, null, o undefined
      alert("Este producto no está disponible para añadir al carrito en este momento.");
      return;
    }

    dispatch(addToCart({ idProducto: producto.idProducto, cantidad: 1 }))
      .unwrap() 
      .then(() => {
        alert(`"${producto.nombreProducto}" añadido al carrito.`);
        
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

  if (!loading && !producto && !error) {
    return (
      <div className="container mt-5 text-center">
        <p className="text-muted fs-5">El producto solicitado no fue encontrado.</p>
      </div>
    );
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger text-center">{error}</div>;
  }


  const imagePath = `/assets/img/productos/${producto.idProducto}/principal.png`;

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Imagen */}
        <div className="col-md-6 mb-4">
          <div className="bg-light d-flex align-items-center justify-content-center p-3 rounded-lg shadow-sm" style={{ maxHeight: "400px", height: "auto" }}>
            <img
              src={imagePath}
              alt={producto.nombreProducto}
              className="img-fluid"
              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
              onError={(e) => { 
                e.target.onerror = null;
                e.target.src = `https://placehold.co/400x300/cccccc/000000?text=No+Imagen+${producto.idProducto}`; 
              }}
            />
          </div>
        </div>

        {/* Información del producto */}
        <div className="col-md-6">
          <h2 className="fw-bold mb-3">{producto.nombreProducto}</h2>
          <p className="text-muted mb-2">
            Marca: <span className="fw-semibold">{producto.marca ? producto.marca.nombreMarca : "No disponible"}</span>
          </p>
          <p className="text-muted mb-2">
            Categorías:{" "}
            <span className="fw-semibold">
              {Array.isArray(producto.categorias) && producto.categorias.length > 0
                ? producto.categorias.map((c) => c.nombreCategoria).join(", ")
                : "No disponible"}
            </span>
          </p>
          <h4 className="fw-bold mb-3 text-primary">${(producto.valorProducto || 0).toLocaleString('es-CO')}</h4>
          <p className=" mb-4">{producto.definicion || "Descripción no disponible."}</p>

          <div className="d-flex gap-2 align-items-center">
            {/* Botón de Agregar al carrito */}
            {/* ✅ CORRECCIÓN APLICADA AQUÍ: Usa `producto.disponibilidad` directamente */}
            {producto.disponibilidad ? ( 
              <button
                className="btn btn-primary rounded-pill fw-semibold" 
                onClick={handleAddToCart}
              >
                <i className="bi bi-cart-plus-fill me-1"></i> Agregar al carrito
              </button>
            ) : (
              <span className="badge bg-secondary py-2 px-3 fs-6">Producto No Disponible</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
