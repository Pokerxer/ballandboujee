import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  badge?: "new" | "limited" | "sold-out";
  sizes?: { size: string; stock: number }[];
  colors?: { name: string; hex: string }[];
  description?: string;
}

interface UIState {
  isQuickViewOpen: boolean;
  quickViewProduct: QuickViewProduct | null;
}

const initialState: UIState = {
  isQuickViewOpen: false,
  quickViewProduct: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openQuickView: (state, action: PayloadAction<QuickViewProduct>) => {
      state.isQuickViewOpen = true;
      state.quickViewProduct = action.payload;
    },
    closeQuickView: (state) => {
      state.isQuickViewOpen = false;
      state.quickViewProduct = null;
    },
  },
});

export const { openQuickView, closeQuickView } = uiSlice.actions;
export default uiSlice.reducer;
