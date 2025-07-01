// src/components/admin/ProductoCategorias.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import categoriaService from '../../services/categoriaService'; 
import productService from '../../services/productService'; 
import productCategoryService from '../../services/productCategoryService'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductoCategorias = () => {
  const { idProducto } = useParams(); 
  const navigate = useNavigate();

  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Cambiado a null para mejor control de mensajes
  const [productName, setProductName] = useState(''); 
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para el guardado

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null); // Limpiar errores al inicio de la carga
      try {
        // 1. Obtener detalles del producto para el nombre
        const productDetails = await productService.getProductById(idProducto);
        
        if (productDetails && typeof productDetails === 'object' && productDetails.nombreProducto) {
          setProductName(productDetails.nombreProducto);
        } else {
          console.warn("No se pudo obtener el nombre del producto o el formato es inesperado. Datos:", productDetails);
          setProductName('Producto Desconocido'); // Valor de fallback
        }

        // 2. Obtener todas las categorías disponibles
        const allCategoriesData = await categoriaService.getAllCategorias(); 

        if (Array.isArray(allCategoriesData)) {
          setAllCategories(allCategoriesData);
        } else {
          console.error("La API de todas las categorías no devolvió un array. Datos recibidos:", allCategoriesData);
          setAllCategories([]);
        }

        // 3. Obtener las categorías ya vinculadas a este producto
        const productCategoriesData = await productCategoryService.getProductCategories(idProducto);

        if (Array.isArray(productCategoriesData)) {
          setSelectedCategoryIds(productCategoriesData.map(cat => cat.idCategoria));
        } else {
          console.error("La API de categorías del producto no devolvió un array. Datos recibidos:", productCategoriesData);
          setSelectedCategoryIds([]); 
        }

        setError(null); 
      } catch (err) {
        console.error("Error al cargar datos de categorías para el producto:", err);
        setError(err.message || "Error al cargar categorías o categorías del producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [idProducto]); 

  const handleCheckboxChange = (categoryId) => {
    setSelectedCategoryIds((prevSelected) => {
      if (prevSelected.includes(categoryId)) {
        return prevSelected.filter((id) => id !== categoryId);
      } else {
        return [...prevSelected, categoryId];
      }
    });
  };

  const handleSaveCategories = async () => {
    setIsSaving(true); // Activar estado de guardado
    setError(null); // Limpiar errores antes de guardar
    try {
      await productCategoryService.syncProductCategories(idProducto, selectedCategoryIds);
      // alert('Categorías del producto actualizadas correctamente.'); // Reemplazado por mensaje más integrado
      // Puedes mostrar un mensaje de éxito temporal aquí si lo deseas, o simplemente navegar
      navigate('/admin/productos', { state: { successMessage: 'Categorías del producto actualizadas correctamente.' } }); 
    } catch (err) {
      console.error("Error al guardar categorías del producto:", err);
      setError(err.message || 'Error al guardar las categorías.');
    } finally {
      setIsSaving(false); // Desactivar estado de guardado
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando categorías...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando categorías y datos del producto...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-tags-fill me-3"></i>
        Gestionar Categorías para: <span className="text-secondary">{productName || `ID ${idProducto}`}</span>
      </h1>

      {/* Mensaje de error global */}
      {error && (
        <div className="alert alert-danger text-center animated fadeIn mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          <button className="btn btn-outline-danger btn-sm ms-3" onClick={() => navigate('/admin/productos')}>
            <i className="bi bi-arrow-left-circle-fill me-2"></i> Volver a Productos
          </button>
        </div>
      )}

      {!error && ( // Solo muestra el contenido si no hay un error global
        <>
          <p className="lead text-center mb-4">Selecciona las categorías que pertenecen a este producto:</p>

          <div className="bg-white p-4 shadow-sm rounded-3 mb-4"> {/* Contenedor mejorado para checkboxes */}
            {allCategories.length > 0 ? (
              allCategories.map((category) => (
                <div className="form-check form-check-lg mb-2" key={category.idCategoria}> {/* form-check-lg para checkboxes más grandes */}
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={category.idCategoria}
                    id={`category-${category.idCategoria}`}
                    checked={selectedCategoryIds.includes(category.idCategoria)}
                    onChange={() => handleCheckboxChange(category.idCategoria)}
                    disabled={isSaving} // Deshabilitar durante el guardado
                  />
                  <label className="form-check-label fw-normal" htmlFor={`category-${category.idCategoria}`}>
                    {category.nombreCategoria}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-3">No hay categorías disponibles para seleccionar.</p>
            )}
          </div>

          <div className="d-flex justify-content-center mt-4"> {/* Centrar botones */}
            <button 
              className="btn btn-primary rounded-pill fw-semibold shadow-sm me-3" 
              onClick={handleSaveCategories} 
              disabled={isSaving}
            >
              <i className="bi bi-save-fill me-2"></i> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              className="btn btn-secondary rounded-pill fw-semibold" 
              onClick={() => navigate('/admin/productos')} 
              disabled={isSaving}
            >
              <i className="bi bi-x-circle-fill me-2"></i> Cancelar
            </button>
          </div>
        </>
      )}

      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default ProductoCategorias;
