// src/pages/client/EditarPerfil.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authServices from "../../services/authService"; // Para obtener el perfil
import clientService from "../../services/clientService"; // Para actualizar el perfil del cliente
import "bootstrap/dist/css/bootstrap.min.css"; // Asegúrate de tener Bootstrap instalado  

const EditarPerfil = () => {
  const [formData, setFormData] = useState({
    nombreCliente: "",
    apellidoCliente: "",
    cedulaCliente: "",
    direccion: "",
    telefonoCliente: "",
    email: "", // El email del usuario, no del cliente directamente
    password: "",
    c_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para el botón de guardar
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(""); // Limpia errores anteriores al cargar
      try {
        // ✅ CORRECCIÓN CLAVE AQUÍ: authServices.getProfile() ya devuelve el objeto user directamente
        const user = await authServices.getProfile(); 

        // Verificamos si el usuario y la relación 'cliente' existen
        if (user && user.cliente) {
          setFormData({
            nombreCliente: user.cliente.nombreCliente || "",
            apellidoCliente: user.cliente.apellidoCliente || "",
            cedulaCliente: user.cliente.cedulaCliente || "",
            direccion: user.cliente.direccion || "",
            telefonoCliente: user.cliente.telefonoCliente || "",
            email: user.email || "", // Accede al email directamente del objeto user
            password: "", // No precargar contraseñas
            c_password: "",
          });
        } else {
            // Si no hay datos de usuario o cliente, es un error o el usuario no es un cliente
            setError("No se encontraron datos de perfil de cliente. ¿Estás logueado como cliente?");
        }
      } catch (err) {
        console.error("Error al cargar el perfil para editar:", err);
        setError(err.message || "No se pudo cargar el perfil para editar.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpia errores al intentar enviar

    if (formData.password && formData.password !== formData.c_password) {
      return setError("Las contraseñas no coinciden.");
    }
    
    setIsSaving(true); // Activa el estado de guardado
    try {
      // ✅ clientService.updateProfile() ahora recibe un objeto con todos los datos
      // y se encarga de enviarlo al backend.
      // Tu backend necesitará un controlador que reciba estos datos y los actualice.
      // Lo que se envía aquí debe coincidir con lo que espera tu API de actualización de perfil de cliente.
      await clientService.updateProfile(formData); 
      
      alert("Perfil actualizado correctamente.");
      navigate("/perfil"); // Redirige de vuelta al perfil
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      // El mensaje de error ya viene formateado desde clientService.updateProfile
      setError(err.message || "Error al actualizar el perfil."); 
    } finally {
      setIsSaving(false); // Desactiva el estado de guardado
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando datos del perfil...</span>
        </div>
        <p className="mt-2 text-muted">Cargando información para editar...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center fw-bold text-primary">Editar tu Perfil</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 rounded-lg">
            <div className="mb-3">
              <label htmlFor="nombreCliente" className="form-label fw-semibold">Nombres</label>
              <input
                type="text"
                name="nombreCliente"
                className="form-control rounded-pill"
                id="nombreCliente"
                value={formData.nombreCliente}
                onChange={handleChange}
                disabled={isSaving} // Deshabilitar durante el guardado
              />
            </div>
            <div className="mb-3">
              <label htmlFor="apellidoCliente" className="form-label fw-semibold">Apellidos</label>
              <input
                type="text"
                name="apellidoCliente"
                className="form-control rounded-pill"
                id="apellidoCliente"
                value={formData.apellidoCliente}
                onChange={handleChange}
                disabled={isSaving} // Deshabilitar durante el guardado
              />
            </div>
            <div className="mb-3">
              <label htmlFor="cedulaCliente" className="form-label fw-semibold">Cédula</label>
              <input
                type="number"
                name="cedulaCliente"
                className="form-control rounded-pill"
                id="cedulaCliente"
                value={formData.cedulaCliente}
                onChange={handleChange}
                disabled={isSaving} // Deshabilitar durante el guardado
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                className="form-control rounded-pill"
                id="email"
                value={formData.email}
                onChange={handleChange}
                readOnly // El email generalmente no se cambia desde aquí
                disabled={isSaving} // Deshabilitar durante el guardado
              />
            </div>
            <div className="mb-3">
              <label htmlFor="direccion" className="form-label fw-semibold">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="form-control rounded-pill"
                id="direccion"
                value={formData.direccion}
                onChange={handleChange}
                disabled={isSaving} // Deshabilitar durante el guardado
              />
            </div>
            <div className="mb-3">
              <label htmlFor="telefonoCliente" className="form-label fw-semibold">Teléfono</label>
              <input
                type="tel"
                name="telefonoCliente"
                className="form-control rounded-pill"
                id="telefonoCliente"
                value={formData.telefonoCliente}
                onChange={handleChange}
                disabled={isSaving} // Deshabilitar durante el guardado
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">Nueva Contraseña</label>
              <input
                type="password"
                name="password"
                className="form-control rounded-pill"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Opcional: ingresa para cambiar"
                disabled={isSaving} // Deshabilitar durante el guardado
              />
            </div>
            <div className="mb-3">
              <label htmlFor="c_password" className="form-label fw-semibold">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                name="c_password"
                className="form-control rounded-pill"
                id="c_password"
                value={formData.c_password}
                onChange={handleChange}
                placeholder="Opcional: repite la nueva contraseña"
                disabled={isSaving} // Deshabilitar durante el guardado
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 rounded-pill fw-semibold"
              disabled={isSaving} // Deshabilitar el botón durante el guardado
            >
              <i className="bi bi-save-fill me-2"></i> {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;
