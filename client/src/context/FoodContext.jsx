import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const FoodContext = createContext(null);

export default function FoodContextProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [userId] = useState("6856ac982fc5014bfb4cfb1c");

  const fetchCart = async () => {
    try {
      const res = await axios(`http://localhost:4000/cart/${userId}`);
      setCartItems(res.data.cartItems || []);
    } catch (err) {
      console.error("❌ Failed to fetch cart:", err);
    }
  };

  const addToCart = async (foodId, quantity = 1) => {
    try {
      const res = await axios.post("http://localhost:4000/cart/add-to-cart", {
        userId,
        foodId,
        quantity,
      });

      if (res.status === 200) {
        setCartItems(res.data.cartItems || []);
      } else {
        console.error("⚠️ Server returned error:", res.data.message);
      }
    } catch (err) {
      console.error("❌ Add to cart error:", err);
    }
  };

  const removeCart = async foodId => {
    try {
      const res = await axios.delete(
        `http://localhost:4000/cart/${userId}/remove/${foodId}`,
      );

      if (res.status === 200) {
        await fetchCart();
      }
    } catch (error) {
      console.error("❌ Failed to remove item from cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <FoodContext.Provider
      value={{ cartItems, addToCart, fetchCart, removeCart, userId }}
    >
      {children}
    </FoodContext.Provider>
  );
}
