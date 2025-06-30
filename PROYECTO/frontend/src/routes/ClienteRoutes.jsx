// src/routes/ClienteRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Home from "../pages/client/Home";
import Marcas from "../pages/client/Marcas";
import Productos from "../pages/client/Productos";

// Las rutas de login, registro, recuperar, carrito y checkout
// han sido movidas a App.js para una gestión centralizada y protección.

export default function ClienteRoutes({ modoPrueba = false }) {
  return (
    <div>
      <Routes>
        {/* Rutas que son accesibles públicamente sin necesidad de autenticación */}
        <Route path="/" element={<Home />} />
        <Route path="/marcas" element={<Marcas />} />
        <Route path="/productos" element={<Productos />} />
        
      </Routes>
    </div>
  );
}
