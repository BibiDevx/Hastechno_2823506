// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Recuperamos los datos de localStorage al iniciar la app
const initialState = {
  isAuthenticated: !!localStorage.getItem('token'),
  usuario: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.usuario = action.payload.user;
      state.token = action.payload.access_token;
      state.error = null;

      // Guardamos en localStorage
      localStorage.setItem('user', JSON.stringify(state.usuario));
      localStorage.setItem('token', state.token);
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.usuario = null;
      state.token = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.usuario = null;
      state.token = null;
      state.error = null;

      // Limpiamos localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

export default authSlice.reducer;
