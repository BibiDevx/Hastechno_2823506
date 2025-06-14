// src/components/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthError } from "../../redux/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { status: authStatus, error: authError } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    try {
      const resultAction = await dispatch(loginUser({ email, password })).unwrap();

      // ✅ CORRECCIÓN CLAVE AQUÍ: Accedemos directamente a 'rol'
      // Esto ahora tomará la cadena "SuperAdmin", "Admin" o "Cliente" directamente.
      const userRoleName = resultAction.user?.rol; 
      
      if (userRoleName === "Admin" || userRoleName === "SuperAdmin") {
        navigate("/admin");
      } else {
        navigate("/perfil");
      }
      
    } catch (err) {
      console.error("Login failed: Error captured:", err);
      if (err.response) { 
        console.error("Server response:", err.response.data);
        console.error("HTTP Status:", err.response.status);
      } else if (err.request) {
        console.error("No response received from server:", err.request);
      } else {
        console.error("Error setting up request:", err.message);
      }
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '450px' }}>
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow p-4 border-0 rounded-lg">
            <h2 className="text-center mb-4 text-primary fw-bold">Iniciar Sesión</h2>
            {authError && <div className="alert alert-danger mb-3">{authError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">Correo electrónico</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={authStatus === 'loading'} 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">Contraseña</label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={authStatus === 'loading'} 
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 rounded-pill fw-bold"
                disabled={authStatus === 'loading'} 
              >
                {authStatus === 'loading' ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
            <div className="mt-3 text-center">
              <Link to="/recuperar" className="text-muted">¿Olvidaste tu contraseña?</Link>
            </div>
            <div className="mt-2 text-center">
              ¿No tienes cuenta? <Link to="/registro" className="text-primary fw-semibold">Regístrate aquí</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
