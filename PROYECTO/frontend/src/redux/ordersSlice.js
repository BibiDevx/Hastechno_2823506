// src/features/orders/ordersSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pedidoService from '../services/pedidoService'; // Asegúrate de que la ruta sea correcta

const initialState = {
  userOrders: [],          // Para almacenar el historial de pedidos completos (Pedido + PedidoProducto + Factura)
  userPurchaseItems: [],   // Para almacenar la lista plana de ítems comprados (solo PedidoProducto)
  status: 'idle',          // 'idle' | 'loading' | 'succeeded' | 'failed' - Estado general de las operaciones
  error: null,             // Para almacenar cualquier mensaje de error
};

/**
 * Thunk asíncrono para obtener el historial de pedidos completos del usuario.
 * Llama a PedidoController@index en el backend.
 */
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pedidoService.getOrders();
      return response;
    } catch (error) {
      console.error('Error en fetchUserOrders:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Thunk asíncrono para obtener la lista plana de ítems de productos comprados por el usuario.
 * Llama a PedidoController@getUserPurchaseItems en el backend.
 */
export const fetchUserPurchaseItems = createAsyncThunk(
  'orders/fetchUserPurchaseItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pedidoService.getUserPurchaseItems();
      return response;
    } catch (error) {
      console.error('Error en fetchUserPurchaseItems:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Aquí puedes añadir reducers síncronos si necesitas manipular el estado de los pedidos localmente,
    // por ejemplo, para limpiar un error específico o restablecer un estado.
  },
  extraReducers: (builder) => {
    builder
      // --- Manejo de estados para fetchUserOrders (historial de pedidos completos) ---
      .addCase(fetchUserOrders.pending, (state) => {
        state.status = 'loading'; // Indica que la carga de pedidos está en progreso
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'; // La carga fue exitosa
        state.userOrders = action.payload; // Almacena los pedidos obtenidos
        state.error = null; // Limpia cualquier error previo
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.status = 'failed'; // La carga falló
        state.error = action.payload; // Almacena el mensaje de error
        state.userOrders = []; // Vacía los pedidos en caso de error
      })
      // --- Manejo de estados para fetchUserPurchaseItems (ítems comprados planos) ---
      .addCase(fetchUserPurchaseItems.pending, (state) => {
        state.status = 'loading'; // Puedes usar el mismo 'status' o uno específico como 'purchaseItemsStatus'
      })
      .addCase(fetchUserPurchaseItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userPurchaseItems = action.payload; // Almacena los ítems de PedidoProducto
        state.error = null;
      })
      .addCase(fetchUserPurchaseItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.userPurchaseItems = []; // Vacía los ítems en caso de error
      });
  },
});

export default ordersSlice.reducer;