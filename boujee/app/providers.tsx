"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import QuickViewModal from "./components/ui/QuickViewModal";
import CartDrawer from "./components/ui/CartDrawer";
import CartInitializer from "./components/providers/CartInitializer";
import WishlistInitializer from "./components/providers/WishlistInitializer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CartInitializer />
      <WishlistInitializer />
      {children}
      <QuickViewModal />
      <CartDrawer />
    </Provider>
  );
}
