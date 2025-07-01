// src/pages/admin/ProductosAdmin.js

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
    disponibilidad: true, // Valor inicial booleano
    idMarca: "",
    idProveedor: "",
    cantidadStock: 0, // Añadido para consistencia si lo manejas
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Para errores globales
  const [modalError, setModalError] = useState(null); // Para errores dentro del modal
  const [modalSuccess, setModalSuccess] = useState(null); // Para mensajes de éxito dentro del modal
  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [isSaving, setIsSaving] = useState(false); // Estado para indicar si se está guardando
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null); 
      try {
        const [productsData, marcasData, proveedoresData] = await Promise.all([
          productService.getAllProductsWithDetailsForAdmin(),
          marcaService.getAllMarcas(),
          proveedorService.getAllProveedores(),
        ]);

        setProducts(Array.isArray(productsData) ? productsData.filter(p => p && p.idProducto !== undefined) : []);
        setMarcas(Array.isArray(marcasData) ? marcasData : []);
        setProveedores(Array.isArray(proveedoresData) ? proveedoresData : []);
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
        setError(err.message || "Error al cargar los datos necesarios. Por favor, intente de nuevo.");
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
    setError(null); // Limpiar errores antes de intentar recargar
    try {
      const productsData = await productService.getAllProductsWithDetailsForAdmin();
      setProducts(Array.isArray(productsData) ? productsData.filter(p => p && p.idProducto !== undefined) : []);
      setError(null);
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
    setModalError(null); // Limpiar errores del modal
    setModalSuccess(null); // Limpiar mensajes de éxito del modal

    if (product) {
      setEditingProduct({
        idProducto: product.idProducto,
        nombreProducto: product.nombreProducto,
        definicion: product.definicion,
        valorProducto: product.valorProducto,
        disponibilidad: product.disponibilidad, // Ya es booleano por el cast de Laravel
        idMarca: product.marca?.idMarca || "", 
        idProveedor: product.proveedor?.idProveedor || "", 
        cantidadStock: product.cantidadStock || 0, // Asegurarse de cargar el stock
      });
    } else {
      setEditingProduct({
        idProducto: null,
        nombreProducto: "",
        definicion: "",
        valorProducto: "",
        disponibilidad: true, // Valor por defecto para nuevo producto
        idMarca: "",
        idProveedor: "",
        cantidadStock: 0, 
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
      valueProducto: "",
      disponibilidad: true,
      idMarca: "",
      idProveedor: "",
      cantidadStock: 0,
    });
    setModalError(null);
    setModalSuccess(null);
  };

  // ✅ Función para mostrar el modal de confirmación de eliminación
  const confirmDelete = (id) => {
    setProductToDelete(id);
    setShowConfirmDeleteModal(true);
  };

  // ✅ Función para ejecutar la eliminación después de la confirmación
  const handleDeleteConfirmed = async () => {
    setShowConfirmDeleteModal(false); // Cerrar el modal de confirmación
    if (!productToDelete) return;

    setLoading(true); // Mostrar carga global
    setError(null); // Limpiar errores globales
    try {
      await productService.deleteProduct(productToDelete);
      setError(null); // No hay error si la eliminación fue exitosa
      // Muestra un mensaje de éxito global si lo deseas, o simplemente recarga
      await fetchProducts(); // Recargar la lista de productos
    } catch (err) {
      console.error("Error al eliminar el producto:", err);
      setError(err.message || "Error al eliminar el producto.");
    } finally {
      setLoading(false); // Ocultar carga
      setProductToDelete(null); // Limpiar el ID del producto a eliminar
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "disponibilidad") {
      // Convierte el string "true" o "false" del select a un booleano
      processedValue = value === "true"; 
    } else if (name === "valorProducto" || name === "cantidadStock") {
      // Asegura que los campos numéricos solo contengan números
      processedValue = value.replace(/[^0-9.]/g, ''); // Permite números y un punto decimal
    }

    setEditingProduct({ ...editingProduct, [name]: processedValue });
  };

  const handleSave = async () => {
    setModalError(null); 
    setModalSuccess(null);
    setIsSaving(true); 

    // Validaciones de Frontend
    if (!editingProduct.nombreProducto.trim()) {
      setModalError("El nombre del producto es obligatorio.");
      setIsSaving(false);
      return;
    }
    if (isNaN(parseFloat(editingProduct.valorProducto)) || parseFloat(editingProduct.valorProducto) <= 0) {
      setModalError("El valor del producto debe ser un número positivo.");
      setIsSaving(false);
      return;
    }
    if (!editingProduct.idMarca) {
      setModalError("Debe seleccionar una marca.");
      setIsSaving(false);
      return;
    }
    if (!editingProduct.idProveedor) {
      setModalError("Debe seleccionar un proveedor.");
      setIsSaving(false);
      return;
    }
    if (isNaN(parseInt(editingProduct.cantidadStock)) || parseInt(editingProduct.cantidadStock) < 0) {
      setModalError("La cantidad en stock debe ser un número entero no negativo.");
      setIsSaving(false);
      return;
    }


    try {
      const productDataToSend = {
        ...editingProduct,
        valorProducto: parseFloat(editingProduct.valorProducto), 
        idMarca: parseInt(editingProduct.idMarca), 
        idProveedor: parseInt(editingProduct.idProveedor), 
        cantidadStock: parseInt(editingProduct.cantidadStock), // Asegurarse de que sea un entero
      };

      if (modalType === "editar" && editingProduct.idProducto) {
        await productService.updateProduct(
          editingProduct.idProducto,
          productDataToSend 
        );
        setModalSuccess("Producto actualizado correctamente.");
      } else if (modalType === "agregar") {
        await productService.createProduct(productDataToSend); 
        setModalSuccess("Producto agregado correctamente.");
        // Opcional: Cerrar el modal automáticamente después de un éxito al agregar
        // setTimeout(() => handleCloseModal(), 1500); 
      }
      await fetchProducts(); // Recargar la lista de productos para ver los cambios
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setModalError(err.message || "Error al guardar el producto. Por favor, revisa los datos.");
    } finally {
      setIsSaving(false); 
    }
  };

  // Renderizado condicional para el estado de carga
  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando información...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Cargando información de productos, marcas y proveedores...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 p-3">
      <h1 className="text-center mb-5 fw-bold text-primary">
        <i className="bi bi-box-seam-fill me-3"></i>Administrar Productos
      </h1>

      {/* Mensaje de error global (si no hay modal abierto) */}
      {error && !showModal && (
        <div className="alert alert-danger text-center animated fadeIn mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      <div className="d-flex justify-content-end mb-3"> {/* Botón a la derecha */}
        <button 
          className="btn btn-success rounded-pill fw-semibold shadow-sm" 
          onClick={() => handleShowModal("agregar")}
        >
          <i className="bi bi-plus-circle-fill me-2"></i> Agregar Producto
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded-lg"> 
        <table className="table table-hover table-striped align-middle"> 
          <thead className="table-dark"> 
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">Descripción</th>
              <th scope="col">Valor</th>
              <th scope="col">Stock</th> {/* Nueva columna para Stock */}
              <th scope="col">Disponibilidad</th> 
              <th scope="col">Marca</th> 
              <th scope="col">Proveedor</th>
              <th scope="col" className="text-center" style={{ minWidth: '250px' }}>Acciones</th> {/* Ajuste de ancho */}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.idProducto}>
                  <td className="fw-bold">{product.idProducto}</td>
                  <td>{product.nombreProducto}</td>
                  <td>{(product.definicion || "N/A").substring(0, 70)}{product.definicion && product.definicion.length > 70 ? '...' : ''}</td> {/* Aumentado el substring */}
                  <td>${(product.valorProducto || 0).toLocaleString('es-CO')}</td> 
                  <td>{product.cantidadStock || 0}</td> {/* Mostrar cantidadStock */}
                  <td>
                    {product.disponibilidad ? 
                      <span className="badge bg-success py-2 px-3 rounded-pill">Disponible</span> : 
                      <span className="badge bg-danger py-2 px-3 rounded-pill">Agotado</span>
                    }
                  </td>
                  <td>{product.marca?.nombreMarca || "N/A"}</td> 
                  <td>{product.proveedor?.nombreProveedor || "N/A"}</td>
                  <td className="text-center"> 
                    <button
                      className="btn btn-primary btn-sm me-2 rounded-pill fw-semibold"
                      onClick={() => handleShowModal("editar", product)}
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm me-2 rounded-pill fw-semibold"
                      onClick={() => confirmDelete(product.idProducto)} // ✅ Usa el nuevo modal de confirmación
                    >
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </button>
                    <button
                      className="btn btn-info btn-sm rounded-pill fw-semibold" 
                      onClick={() => navigate(`/admin/productos/${product.idProducto}/categorias`)}
                    >
                      <i className="bi bi-tags-fill me-1"></i> Categorías
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-muted fs-5"> {/* Ajuste de colSpan */}
                  {loading ? "Cargando productos..." : "No se encontraron productos."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Agregar/Editar Producto */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> {/* Tamaño grande */}
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${modalType === "agregar" ? "bi-plus-circle-fill" : "bi-pencil-fill"} me-2`}></i>
                  {modalType === "agregar" ? "Agregar Nuevo Producto" : "Editar Producto"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                {modalError && (
                  <div className="alert alert-danger text-center animated fadeIn mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {modalError}
                  </div>
                )}
                {modalSuccess && (
                  <div className="alert alert-success text-center animated fadeIn mb-3" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i> {modalSuccess}
                  </div>
                )}
                <form>
                  <div className="mb-3">
                    <label htmlFor="nombreProducto" className="form-label fw-semibold">
                      <i className="bi bi-tag-fill me-2"></i>Nombre
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      id="nombreProducto"
                      name="nombreProducto"
                      value={editingProduct.nombreProducto}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="definicion" className="form-label fw-semibold">
                      <i className="bi bi-file-text-fill me-2"></i>Descripción
                    </label>
                    <textarea 
                      className="form-control form-control-lg rounded-pill"
                      id="definicion"
                      name="definicion"
                      value={editingProduct.definicion}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      rows="3" // Ajuste de filas
                    ></textarea>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="valorProducto" className="form-label fw-semibold">
                        <i className="bi bi-currency-dollar me-2"></i>Valor
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg rounded-pill"
                        id="valorProducto"
                        name="valorProducto"
                        value={editingProduct.valorProducto}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        required
                        min="0" // Valor mínimo
                        step="0.01" // Permite decimales
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="cantidadStock" className="form-label fw-semibold">
                        <i className="bi bi-box-seam-fill me-2"></i>Cantidad en Stock
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg rounded-pill"
                        id="cantidadStock"
                        name="cantidadStock"
                        value={editingProduct.cantidadStock}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        required
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="disponibilidad" className="form-label fw-semibold">
                      <i className="bi bi-check-circle-fill me-2"></i>Disponibilidad
                    </label>
                    <select
                      className="form-select form-control-lg rounded-pill"
                      id="disponibilidad"
                      name="disponibilidad"
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
                    <label htmlFor="idMarca" className="form-label fw-semibold">
                      <i className="bi bi-award-fill me-2"></i>Marca
                    </label>
                    <select
                      className="form-select form-control-lg rounded-pill"
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
                    <label htmlFor="idProveedor" className="form-label fw-semibold">
                      <i className="bi bi-truck-fill me-2"></i>Proveedor
                    </label>
                    <select
                      className="form-select form-control-lg rounded-pill"
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
              <div className="modal-footer rounded-bottom-3">
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

      {/* ✅ Modal de Confirmación de Eliminación */}
      {showConfirmDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-danger text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Confirmar Eliminación
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmDeleteModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="fs-5 mb-4">¿Estás seguro de que deseas eliminar este producto?</p>
                <p className="text-muted small">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer rounded-bottom-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill fw-semibold me-3"
                  onClick={() => setShowConfirmDeleteModal(false)}
                >
                  <i className="bi bi-x-circle-fill me-2"></i> Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger rounded-pill fw-semibold" 
                  onClick={handleDeleteConfirmed}
                >
                  <i className="bi bi-trash-fill me-2"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-dark text-light text-center p-4 mt-5 shadow-lg rounded-top-lg">
        <p className="mb-0 small">© 2025 PC Componentes | Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default ProductosAdmin;
