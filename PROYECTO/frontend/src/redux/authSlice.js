// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';
import { mergeGuestCartAndFetchUserCart, fetchCartItems, clearLocalCart } from './cartSlice';
import { getOrCreateGuestId } from '../utils/guestCartUtils';

const getToken = () => localStorage.getItem('token');
const getUserFromLocalStorage = () => {
  try {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
    return null;
  }
};

const initialState = {
  isAuthenticated: !!getToken(),
  user: getUserFromLocalStorage(),
  token: getToken(),
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.login(email, password);
      const { user, access_token } = response;

      // ✅ CORRECCIÓN CLAVE AQUÍ: Accedemos directamente a 'rol' si es un string.
      // Si en el futuro 'rol' vuelve a ser un objeto con 'nombreRol', esto necesitará ajustarse.
      // Por ahora, 'user.rol' es directamente "SuperAdmin", "Admin", "Cliente".
      const userRoleName = user?.rol; 

      

      // LÓGICA CONDICIONAL PARA EL CARRITO BASADA EN EL ROL DEL USUARIO
      if (userRoleName !== "Admin" && userRoleName !== "SuperAdmin") {
        const guestId = getOrCreateGuestId();
        if (guestId) {
          dispatch(mergeGuestCartAndFetchUserCart(guestId));
        } else {
          dispatch(fetchCartItems());
        }
      } else {

        dispatch(clearLocalCart()); 
      }

      return { user, token: access_token };
    } catch (error) {
      console.error('DEBUG: LoginUser thunk caught error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.registerCliente(userData);
      const { user, access_token } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      const guestId = getOrCreateGuestId();
      if (guestId) {
        dispatch(mergeGuestCartAndFetchUserCart(guestId));
      } else {
        dispatch(fetchCartItems());
      }

      return { user, token: access_token };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user || null;
      state.token = action.payload.token || null;
      state.status = 'succeeded';
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        clearLocalCart();
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        clearLocalCart();
      });
  },
});

export const { setAuth, logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
