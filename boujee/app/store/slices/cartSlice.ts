import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch {
    console.error("Failed to save cart to localStorage");
  }
};

const initialState: CartState = {
  items: [],
  isDrawerOpen: false,
  isLoading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  "cart/createOrder",
  async (
    orderData: {
      orderItems: CartItem[];
      shipping: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
      };
      paymentMethod: string;
      subtotal: number;
      shippingCost: number;
      tax: number;
      total: number;
      userId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to create order");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Failed to create order");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initializeCart: (state) => {
      state.items = loadCartFromStorage();
    },
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>) => {
      const { quantity = 1, ...payload } = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item.id === payload.id &&
          item.size === payload.size &&
          item.color === payload.color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ ...payload, quantity });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ id: string; size: string; color?: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.id === action.payload.id &&
            item.size === action.payload.size &&
            item.color === action.payload.color
          )
      );
      saveCartToStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{
        id: string;
        size: string;
        color?: string;
        quantity: number;
      }>
    ) => {
      const item = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(
            (i) =>
              !(
                i.id === action.payload.id &&
                i.size === action.payload.size &&
                i.color === action.payload.color
              )
          );
        }
      }
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        saveCartToStorage(state.items);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  initializeCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
} = cartSlice.actions;

export default cartSlice.reducer;
