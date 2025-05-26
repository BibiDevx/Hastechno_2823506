import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import categoriaService from '../../services/categoriaService';
import productCategoryService from '../../services/productCategoryService';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductoCategorias = () => {
  const { idProducto } = useParams();
  const navigate = useNavigate();
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productName] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Obtener todas las categorías disponibles
        const { data: allCatsApiResult } = await categoriaService.getAllCategorias();
        // Asumiendo que categoriaService.getAllCategorias() también devuelve {data: [...]}
        if (Array.isArray(allCatsApiResult.data)) {
          setAllCategories(allCatsApiResult.data);
        } else {
          console.error("La API de todas las categorías no devolvió un array en .data:", allCatsApiResult);
          setAllCategories([]);
        }


        // 2. Obtener las categorías ya vinculadas a este producto
        const { data: productCatsApiResult } = await productCategoryService.getProductCategories(idProducto);

        // ¡AQUÍ ESTÁ EL PUNTO CLAVE!
        // Tu respuesta de Postman muestra que el array está en 'data.data'
        // Por lo tanto, necesitas acceder a productCatsApiResult.data
        if (Array.isArray(productCatsApiResult.data)) { // <-- ¡VERIFICA que productCatsApiResult.data sea un array!
          setSelectedCategoryIds(productCatsApiResult.data.map(cat => cat.idCategoria));
        } else {
          console.error("La API de categorías del producto no devolvió un array en .data:", productCatsApiResult);
          setSelectedCategoryIds([]); // Asegura que sea un array vacío para evitar errores futuros
        }

        setError('');
      } catch (err) {
        console.error("Error al cargar datos de categorías para el producto:", err);
        if (err.response && err.response.status === 404) {
            setError("Producto no encontrado.");
        } else if (err.response && err.response.status === 401) {
            setError("No autorizado. Asegúrate de iniciar sesión como administrador.");
        }
        else {
            setError("Error al cargar categorías o categorías del producto.");
        }
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
    try {
      await productCategoryService.syncProductCategories(idProducto, selectedCategoryIds);
      alert('Categorías del producto actualizadas correctamente.');
      navigate('/admin/productos');
    } catch (err) {
      console.error("Error al guardar categorías del producto:", err);
      setError(err.response?.data?.message || 'Error al guardar las categorías.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-4">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Gestionar Categorías para Producto {idProducto} {productName && `(${productName})`}</h2>
      <p>Selecciona las categorías que pertenecen a este producto:</p>

      <div className="mb-3">
        {allCategories.length > 0 ? (
          allCategories.map((category) => (
            <div className="form-check" key={category.idCategoria}>
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
          <p>No hay categorías disponibles.</p>
        )}
      </div>

      <div className="d-flex justify-content-start">
        <button className="btn btn-primary me-2" onClick={handleSaveCategories} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/productos')}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ProductoCategorias;