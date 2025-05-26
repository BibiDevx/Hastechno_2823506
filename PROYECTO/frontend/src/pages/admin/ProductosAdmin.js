import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import productService from "../../services/productService";
import marcaService from "../../services/marcaService";
import proveedorService from "../../services/proveedorService";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductosAdmin = () => {
  const navigate = useNavigate(); // Inicializamos useNavigate para la navegación

  // Estados del componente
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  // El estado 'selectedCategory' y la constante CATEGORIES se eliminan, ya no se usan para el filtro.
  const [editingProduct, setEditingProduct] = useState({
    idProducto: null,
    nombreProducto: "",
    definicion: "",
    valorProducto: "",
    disponibilidad: true,
    idMarca: "",
    idProveedor: "",
    // El campo 'categorias' se elimina de aquí, ya que la gestión se hará en otra página.
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  // El estado 'categorias' (que se usaba para el filtro o select múltiple) también se elimina.

  // Efecto para cargar datos iniciales: productos, marcas y proveedores.
  useEffect(() => {
    fetchProducts();
    fetchMarcas();
    fetchProveedores();
  }, []);

  // Función para cargar la lista de marcas
  const fetchMarcas = async () => {
    try {
      const { data } = await marcaService.getAllMarcas();
      setMarcas(data);
    } catch (err) {
      console.error("Error al cargar las marcas:", err);
      setError("Error al cargar las marcas.");
    }
  };

  // Función para cargar la lista de proveedores
  const fetchProveedores = async () => {
    try {
      const { data } = await proveedorService.getAllProveedores();
      setProveedores(data);
    } catch (err) {
      console.error("Error al cargar los proveedores:", err);
      setError("Error al cargar los proveedores.");
    }
  };

  // Función para cargar la lista de productos
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Asumiendo que getAllProductsWithDetailsForAdmin ahora NO incluye las categorías en la respuesta del producto
      // si no las necesitas aquí, o si las incluye, no afectará el funcionamiento actual.
      const { data } = await productService.getAllProductsWithDetailsForAdmin();
      // Filtra cualquier posible elemento null/undefined en la respuesta del backend
      const cleanedData = data.filter(product => product && product.idProducto !== undefined);
      setProducts(cleanedData);
      setError("");
    } catch (err) {
      console.error("Error al cargar los productos:", err);
      setError("Error al cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar el modal (agregar o editar)
  const handleShowModal = (type, product = null) => {
    setModalType(type);
    if (product) {
      setEditingProduct({
        idProducto: product.idProducto,
        nombreProducto: product.nombreProducto,
        definicion: product.definicion,
        valorProducto: product.valorProducto,
        disponibilidad: product.disponibilidad,
        idMarca: product.marca?.idMarca || "",
        idProveedor: product.proveedor?.idProveedor || "",
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

  // Función para cerrar el modal
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

  // Función para eliminar un producto
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await productService.deleteProduct(id);
        fetchProducts(); // Recarga la lista después de eliminar
        alert("Producto eliminado correctamente.");
      } catch (err) {
        console.error("Error al eliminar el producto:", err);
        setError("Error al eliminar el producto.");
      }
    }
  };

  // Función para manejar los cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convierte el valor de disponibilidad a booleano
    const processedValue = name === "disponibilidad" ? value === "Disponible" : value;
    setEditingProduct({ ...editingProduct, [name]: processedValue });
  };

  // La función 'handleCategoryChange' y su lógica se eliminan.

  // Función para guardar (crear o editar) un producto
  const handleSave = async () => {
    try {
      if (modalType === "editar" && editingProduct.idProducto) {
        // Asegúrate de que tu backend (productoController.php) NO espere el campo 'categorias'
        // cuando actualizas un producto desde este formulario, ya que lo quitamos de editingProduct.
        const response = await productService.updateProduct(
          editingProduct.idProducto,
          editingProduct
        );
        console.log("Respuesta de la actualización:", response);
        alert("Producto actualizado correctamente.");
        await fetchProducts(); // Recarga para asegurar consistencia y actualizar la tabla
      } else if (modalType === "agregar") {
        // Asegúrate de que tu backend (productoController.php) NO espere el campo 'categorias'
        // cuando creas un producto desde este formulario.
        const response = await productService.createProduct(editingProduct);
        console.log("Respuesta de la creación:", response);
        alert("Producto agregado correctamente.");
        handleCloseModal(); // Cierra el modal
        await fetchProducts(); // Recarga todos los productos para mostrar el nuevo
      }
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setError(
        err.response?.data?.message || "Error al guardar el producto. Por favor, revisa los datos."
      );
    }
  };

  // 'filteredProducts' y su lógica se eliminan por completo.
  // Ahora, siempre mostraremos todos los productos que están en el estado 'products'.
  const productsToDisplay = products;

  // Renderizado condicional para el estado de carga y error
  // Ya no se espera la carga de 'categorias' en este componente.
  if (loading || marcas.length === 0 || proveedores.length === 0) {
    return <div className="container mt-4">Cargando información...</div>;
  }

  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Administrar Productos</h2>

      <div className="d-flex justify-content-end mb-3"> {/* Eliminado el select de filtro, justificado a la derecha */}
        <button className="btn btn-success" onClick={() => handleShowModal("agregar")}>
          Agregar Producto
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Valor</th>
            <th>Disponibilidad</th>
            <th>Proveedor</th>
            <th>Acciones</th>
            <th>Categorías</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(productsToDisplay) && productsToDisplay.length > 0 ? (
            productsToDisplay.map((product) => (
              <tr key={product.idProducto}>
                <td>{product.idProducto}</td>
                <td>{product.nombreProducto}</td>
                <td>{product.definicion || "N/A"}</td>
                <td>${product.valorProducto}</td>
                <td>{product.disponibilidad ? "Disponible" : "Agotado"}</td>
                <td>{product.proveedor?.nombreProveedor || "N/A"}</td>
                <td>
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => handleShowModal("editar", product)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(product.idProducto)}
                  >
                    Eliminar
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/admin/productos/${product.idProducto}/categorias`)}
                  >
                    Gestionar Categorías
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                {loading ? "Cargando productos..." : "No se encontraron productos."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "agregar" ? "Agregar Producto" : "Editar Producto"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombreProducto"
                      value={editingProduct.nombreProducto}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <input
                      type="text"
                      className="form-control"
                      name="definicion"
                      value={editingProduct.definicion}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Valor</label>
                    <input
                      type="number"
                      className="form-control"
                      name="valorProducto"
                      value={editingProduct.valorProducto}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Disponibilidad</label>
                    <select
                      className="form-select"
                      name="disponibilidad"
                      value={editingProduct.disponibilidad ? "Disponible" : "Agotado"}
                      onChange={handleInputChange}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Agotado">Agotado</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Marca</label>
                    <select
                      className="form-select"
                      name="idMarca"
                      value={editingProduct.idMarca}
                      onChange={handleInputChange}
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
                    <label className="form-label">Proveedor</label>
                    <select
                      className="form-select"
                      name="idProveedor"
                      value={editingProduct.idProveedor}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar Proveedor</option>
                      {proveedores.map((proveedor) => (
                        <option key={proveedor.idProveedor} value={proveedor.idProveedor}>
                          {proveedor.nombreProveedor}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* El campo de selección de categorías ha sido eliminado de este modal */}
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cerrar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  Guardar
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