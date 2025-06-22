import axios from "axios";
import { createContext, useState } from "react";

export const FoodContext = createContext(null);

export default function FoodContextProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [userId] = useState("6856ac982fc5014bfb4cfb1c"); // Hardcoded user ID

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/cart/${userId}`);
      setCartItems(res.data.items || []);
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
        setCartItems(res.data.cart.items || []);
      } else {
        console.error("⚠️ Server returned error:", res.data.message);
      }
    } catch (err) {
      console.error("❌ Add to cart error:", err);
    }
  };

  return (
    <FoodContext.Provider value={{ cartItems, addToCart, fetchCart, userId }}>
      {children}
    </FoodContext.Provider>
  );
}
