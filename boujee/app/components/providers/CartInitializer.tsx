"use client";

import { useEffect } from "react";
import { useAppDispatch } from "../../hooks/useStore";
import { initializeCart } from "../../store/slices/cartSlice";

export default function CartInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeCart());
  }, [dispatch]);

  return null;
}
