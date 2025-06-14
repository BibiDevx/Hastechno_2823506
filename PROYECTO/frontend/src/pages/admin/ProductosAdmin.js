import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import productService from "../../services/productService";
import marcaService from "../../services/marcaService";
import proveedorService from "../../services/proveedorService";
import "bootstrap/dist/css/bootstrap.min.css"; 

const ProductosAdmin = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "editar" o "agregar"
  const [editingProduct, setEditingProduct] = useState({
    idProducto: null,
    nombreProducto: "",
    definicion: "",
    valorProducto: "",
    disponibilidad: true,
    idMarca: "",
    idProveedor: "",
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [isSaving, setIsSaving] = useState(false); // Estado para indicar si se está guardando

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(""); 
      try {
        const [productsData, marcasData, proveedoresData] = await Promise.all([
          productService.getAllProductsWithDetailsForAdmin(),
          marcaService.getAllMarcas(),
          proveedorService.getAllProveedores(),
        ]);

        // Asegúrate de que los datos sean arrays antes de setearlos
        setProducts(Array.isArray(productsData) ? productsData.filter(p => p && p.idProducto !== undefined) : []);
        setMarcas(Array.isArray(marcasData) ? marcasData : []);
        setProveedores(Array.isArray(proveedoresData) ? proveedoresData : []);
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
        setError(err.message || "Error al cargar los datos necesarios.");
        setProducts([]);
        setMarcas([]);
        setProveedores([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const fetchProducts = async () => {
    setLoading(true); 
    setError(""); // Limpiar errores antes de intentar recargar
    try {
      const productsData = await productService.getAllProductsWithDetailsForAdmin();

      setProducts(Array.isArray(productsData) ? productsData.filter(p => p && p.idProducto !== undefined) : []);
      setError("");
    } catch (err) {
      console.error("Error al recargar los productos:", err);
      setError(err.message || "Error al recargar los productos.");
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (type, product = null) => {
    setModalType(type);
    setError(""); 
    if (product) {
      setEditingProduct({
        idProducto: product.idProducto,
        nombreProducto: product.nombreProducto,
        definicion: product.definicion,
        valorProducto: product.valorProducto,
        disponibilidad: product.disponibilidad,
        idMarca: product.marca?.idMarca || "", // Acceder a idMarca del objeto marca anidado
        idProveedor: product.proveedor?.idProveedor || "", // Acceder a idProveedor del objeto proveedor anidado
      });
    } else {
      setEditingProduct({
        idProducto: null,
        nombreProducto: "",
        definicion: "",
        valorProducto: "",
        disponibilidad: true,
        idMarca: "",
        idProveedor: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct({
      idProducto: null,
      nombreProducto: "",
      definicion: "",
      valorProducto: "",
      disponibilidad: true,
      idMarca: "",
      idProveedor: "",
    });
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      setLoading(true); // Mostrar carga mientras se elimina
      try {
        await productService.deleteProduct(id);
        alert("Producto eliminado correctamente.");
        await fetchProducts(); // Recargar la lista de productos
      } catch (err) {
        console.error("Error al eliminar el producto:", err);
        setError(err.message || "Error al eliminar el producto.");
      } finally {
        setLoading(false); // Ocultar carga
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Manejar el input de disponibilidad como un booleano
    const processedValue = name === "disponibilidad" 
                           ? (value === "true" || value === "Disponible") // 'true' si el valor es el string "true" o "Disponible"
                           : value; 
    setEditingProduct({ ...editingProduct, [name]: processedValue });
  };

  const handleSave = async () => {
    setError(""); 
    setIsSaving(true); 

    // Validaciones de Frontend
    if (!editingProduct.nombreProducto.trim()) {
      setError("El nombre del producto es obligatorio.");
      setIsSaving(false);
      return;
    }
    if (isNaN(parseFloat(editingProduct.valorProducto)) || parseFloat(editingProduct.valorProducto) <= 0) {
      setError("El valor del producto debe ser un número positivo.");
      setIsSaving(false);
      return;
    }
    if (!editingProduct.idMarca) {
      setError("Debe seleccionar una marca.");
      setIsSaving(false);
      return;
    }
    if (!editingProduct.idProveedor) {
      setError("Debe seleccionar un proveedor.");
      setIsSaving(false);
      return;
    }

    try {
      const productDataToSend = {
        ...editingProduct,
        valorProducto: parseFloat(editingProduct.valorProducto), 
        idMarca: parseInt(editingProduct.idMarca), // Asegurarse de que sea un entero
        idProveedor: parseInt(editingProduct.idProveedor), // Asegurarse de que sea un entero
      };

      if (modalType === "editar" && editingProduct.idProducto) {
        await productService.updateProduct(
          editingProduct.idProducto,
          productDataToSend 
        );
        alert("Producto actualizado correctamente.");
      } else if (modalType === "agregar") {
        await productService.createProduct(productDataToSend); 
        alert("Producto agregado correctamente.");
        handleCloseModal(); // Cerrar modal después de agregar
      }
      await fetchProducts(); // Recargar la lista de productos para ver los cambios
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      // El mensaje de error ya debe venir del servicio
      setError(err.message || "Error al guardar el producto. Por favor, revisa los datos.");
    } finally {
      setIsSaving(false); 
    }
  };

  // Renderizado condicional para el estado de carga
  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando información...</span>
        </div>
        <p className="mt-2 text-muted">Cargando información de productos, marcas y proveedores...</p>
      </div>
    );
  }

  // Renderizado condicional para el error global (no del modal)
  if (error && !showModal) { 
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Productos</h2>

      <div className="d-flex justify-content-start mb-3"> 
        <button 
          className="btn btn-success" 
          onClick={() => handleShowModal("agregar")}
        >
          <i className="bi bi-plus-circle-fill me-2"></i> Agregar Producto
        </button>
      </div>

      <div className="table-responsive"> 
        <table className="table table-bordered table-hover shadow-sm"> 
          <thead className="table-dark"> 
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Valor</th>
              <th>Disp.</th> 
              <th>Marca</th> 
              <th>Proveedor</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.idProducto}>
                  <td>{product.idProducto}</td>
                  <td>{product.nombreProducto}</td>
                  <td>{(product.definicion || "N/A").substring(0, 50)}{product.definicion && product.definicion.length > 50 ? '...' : ''}</td>
                  <td>${(product.valorProducto || 0).toLocaleString()}</td> 
                  <td>
                    {product.disponibilidad ? 
                      <span className="badge bg-success">Disponible</span> : 
                      <span className="badge bg-danger">Agotado</span>
                    }
                  </td>
                  <td>{product.marca?.nombreMarca || "N/A"}</td> 
                  <td>{product.proveedor?.nombreProveedor || "N/A"}</td>
                  <td className="text-center" style={{ minWidth: '200px' }}> 
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleShowModal("editar", product)}
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleDelete(product.idProducto)}
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                    <button
                      className="btn btn-info btn-sm" // Cambio a info o secondary para gestionar categorías
                      onClick={() => navigate(`/admin/productos/${product.idProducto}/categorias`)}
                    >
                      <i className="bi bi-tags-fill me-1"></i> Categorías
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted"> 
                  {loading ? "Cargando productos..." : "No se encontraron productos."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {modalType === "agregar" ? "Agregar Producto" : "Editar Producto"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <form>
                  <div className="mb-3">
                    <label htmlFor="nombreProducto" className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombreProducto"
                      name="nombreProducto"
                      value={editingProduct.nombreProducto}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="definicion" className="form-label">Descripción</label>
                    <textarea 
                      className="form-control"
                      id="definicion"
                      name="definicion"
                      value={editingProduct.definicion}
                      onChange={handleInputChange}
                      disabled={isSaving}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="valorProducto" className="form-label">Valor</label>
                    <input
                      type="number"
                      className="form-control"
                      id="valorProducto"
                      name="valorProducto"
                      value={editingProduct.valorProducto}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="disponibilidad" className="form-label">Disponibilidad</label>
                    <select
                      className="form-select"
                      id="disponibilidad"
                      name="disponibilidad"
                      // Convertir booleano a string para el valor del select
                      value={editingProduct.disponibilidad ? "true" : "false"} 
                      onChange={handleInputChange}
                      disabled={isSaving}
                      required
                    >
                      <option value="true">Disponible</option>
                      <option value="false">Agotado</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="idMarca" className="form-label">Marca</label>
                    <select
                      className="form-select"
                      id="idMarca"
                      name="idMarca"
                      value={editingProduct.idMarca}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      required
                    >
                      <option value="">Seleccionar Marca</option>
                      {marcas.map((marca) => (
                        <option key={marca.idMarca} value={marca.idMarca}>
                          {marca.nombreMarca}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="idProveedor" className="form-label">Proveedor</label>
                    <select
                      className="form-select"
                      id="idProveedor"
                      name="idProveedor"
                      value={editingProduct.idProveedor}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      required
                    >
                      <option value="">Seleccionar Proveedor</option>
                      {proveedores.map((proveedor) => (
                        <option key={proveedor.idProveedor} value={proveedor.idProveedor}>
                          {proveedor.nombreProveedor}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill fw-semibold me-2"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  <i className="bi bi-x-circle-fill me-2"></i> Cerrar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary rounded-pill fw-semibold" 
                  onClick={handleSave}
                  disabled={isSaving} 
                >
                  <i className="bi bi-save-fill me-2"></i> {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosAdmin;
