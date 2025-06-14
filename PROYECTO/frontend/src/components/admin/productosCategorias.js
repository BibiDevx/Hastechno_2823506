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
  const [error, setError] = useState('');
  const [productName, setProductName] = useState(''); 

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(''); 
      try {
        // 1. Obtener detalles del producto para el nombre
        // Los servicios ahora deberían devolver el objeto/array directamente si tienen éxito.
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

        setError(''); 
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
    setLoading(true);
    setError('');
    try {
      await productCategoryService.syncProductCategories(idProducto, selectedCategoryIds);
      alert('Categorías del producto actualizadas correctamente.');
      navigate('/admin/productos'); 
    } catch (err) {
      console.error("Error al guardar categorías del producto:", err);
      setError(err.message || 'Error al guardar las categorías.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando categorías...</span>
        </div>
        <p className="mt-2 text-muted">Cargando categorías y datos del producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 alert alert-danger text-center">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
        <button className="btn btn-primary mt-3 d-block mx-auto" onClick={() => navigate('/admin/productos')}>
          Volver a Productos
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        Gestionar Categorías para Producto: {productName || `ID ${idProducto}`}
      </h2>
      <p>Selecciona las categorías que pertenecen a este producto:</p>

      <div className="mb-3 p-3 border rounded shadow-sm bg-light">
        {allCategories.length > 0 ? (
          allCategories.map((category) => (
            <div className="form-check mb-2" key={category.idCategoria}>
              <input
                className="form-check-input"
                type="checkbox"
                value={category.idCategoria}
                id={`category-${category.idCategoria}`}
                checked={selectedCategoryIds.includes(category.idCategoria)}
                onChange={() => handleCheckboxChange(category.idCategoria)}
              />
              <label className="form-check-label" htmlFor={`category-${category.idCategoria}`}>
                {category.nombreCategoria}
              </label>
            </div>
          ))
        ) : (
          <p className="text-muted">No hay categorías disponibles para seleccionar.</p>
        )}
      </div>

      <div className="d-flex justify-content-start mt-4">
        <button className="btn btn-primary me-2" onClick={handleSaveCategories} disabled={loading}>
          <i className="bi bi-save-fill me-2"></i> {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/productos')} disabled={loading}>
          <i className="bi bi-x-circle-fill me-2"></i> Cancelar
        </button>
      </div>
    </div>
  );
};

export default ProductoCategorias;
