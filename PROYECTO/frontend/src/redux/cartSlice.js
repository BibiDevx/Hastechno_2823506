// src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import carritoService from '../services/carritoService'; // Ruta a tu nuevo servicio
// eslint-disable-next-line no-unused-vars
import { getOrCreateGuestId, removeGuestId } from '../utils/guestCartUtils'; // Utilidades para guest_id

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- Acciones Asíncronas (Thunks) ---

export const fetchCartItems = createAsyncThunk(
  'carrito/fetchCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await carritoService.getCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'carrito/addToCart',
  async (itemData, { dispatch, rejectWithValue }) => {
    try {
      const response = await carritoService.addToCart(itemData);
      return response; // El backend devuelve el ítem del carrito (con idCarrito, idProducto, cantidad y producto)
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'carrito/updateCartItem',
  async ({ idCarrito, cantidad }, { rejectWithValue }) => {
    try {
      const response = await carritoService.updateCartItem(idCarrito, { cantidad });
      return response; // Puede ser el ítem actualizado O { idCarrito: id, removed: true }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'carrito/removeCartItem',
  async (idCarrito, { rejectWithValue }) => {
    try {
      await carritoService.removeCartItem(idCarrito);
      return idCarrito; // Retorna el idCarrito para actualizar el estado local
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearAllCartItems = createAsyncThunk(
  'carrito/clearAllCartItems',
  async (_, { rejectWithValue }) => {
    try {
      await carritoService.clearCart();
      return true; // Indicador de éxito
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const mergeGuestCartAndFetchUserCart = createAsyncThunk(
  'carrito/mergeGuestCartAndFetchUserCart',
  async (guestId, { rejectWithValue, dispatch }) => {
    try {
      const userCartItems = await carritoService.mergeGuestCart(guestId);
      removeGuestId(); // Elimina el guest_id de localStorage después de la fusión
      return userCartItems; // Retorna el carrito del usuario logueado
    } catch (error) {
      // Si la fusión falla, es un problema. Podrías querer vaciar el carrito del frontend o mostrar un error.
      // dispatch(clearAllCartItems()); // Opcional: Si quieres vaciarlo en caso de error de fusión
      return rejectWithValue(error.message);
    }
  }
);

// --- Declaración estándar del slice ---
const cartSlice = createSlice({ // <<-- CAMBIADO AQUÍ: Declarar como 'const'
  name: 'carrito',
  initialState,
  reducers: {
    setInitialCartState: (state, action) => {
      state.items = action.payload;
      state.status = 'idle';
      state.error = null;
    },
    clearLocalCart: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      removeGuestId();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.items = [];
      })
      .addCase(addToCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newItem = action.payload;
        const existingItemIndex = state.items.findIndex(item => item.idProducto === newItem.idProducto);
        
        if (existingItemIndex > -1) {
          state.items[existingItemIndex] = newItem; 
        } else {
          state.items.push(newItem);
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateCartItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedItemOrRemoved = action.payload;

        if (updatedItemOrRemoved.removed) {
          state.items = state.items.filter(item => item.idCarrito !== updatedItemOrRemoved.idCarrito);
        } else {
          const index = state.items.findIndex(item => item.idCarrito === updatedItemOrRemoved.idCarrito);
          if (index > -1) {
            state.items[index] = updatedItemOrRemoved;
          }
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(removeCartItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.idCarrito !== action.payload);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(clearAllCartItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(clearAllCartItems.fulfilled, (state) => {
        state.status = 'succeeded';
        state.items = [];
      })
      .addCase(clearAllCartItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(mergeGuestCartAndFetchUserCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(mergeGuestCartAndFetchUserCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(mergeGuestCartAndFetchUserCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.items = [];
      });
  },
});

// --- Exportaciones separadas ---
export const { setInitialCartState, clearLocalCart } = cartSlice.actions;

export default cartSlice.reducer;
