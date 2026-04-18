"use client";

import { useEffect } from "react";
import { useAppDispatch } from "../../hooks/useStore";
import { initializeWishlist } from "../../store/slices/wishlistSlice";

export default function WishlistInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeWishlist());
  }, [dispatch]);

  return null;
}
