// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice"; // Asegúrate de que la ruta a tu authSlice sea correcta
import ordersReducer from "./ordersSlice";

const store = configureStore({
  reducer: {
    carrito: cartReducer,
    auth: authReducer, 
    orders: ordersReducer,
  },
});

export default store;