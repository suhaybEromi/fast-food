import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const FoodContext = createContext(null);

export default function FoodContextProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  const signup = async (username, email, password) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/user/signup",
        { username, email, password },
        { withCredentials: true },
      );
      // setUser(res.data);
      setUser(res.data.user);
      await fetchCart();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Signup failed");
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/user/login",
        { email, password },
        { withCredentials: true },
      );
      setUser(res.data.user);
      await fetchCart();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/user/logout",
        {},
        { withCredentials: true },
      );
      setUser(null);
      setCartItems([]);
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  const fetchCart = async () => {
    if (!user) return;

    try {
      const res = await axios.get(`http://localhost:4000/cart`, {
        withCredentials: true,
      });
      setCartItems(res.data.cartItems || []);
    } catch (err) {
      console.error("❌ Failed to fetch cart:", err);
    }
  };

  const checkUser = async () => {
    try {
      const res = await axios.get("http://localhost:4000/cart", {
        withCredentials: true,
      });

      if (res.data.user) {
        setUser(res.data.user);
        setCartItems(res.data.cartItems || []);
      }
    } catch (err) {
      console.error("❌ Auto login failed:", err);
      setUser(null);
    }
  };

  const addToCart = async (foodId, quantity = 1) => {
    try {
      if (!user) {
        alert("Please login first to add items to your cart.");
        return;
      }

      const res = await axios.post(
        "http://localhost:4000/cart/add-to-cart",
        {
          userId: user._id,
          foodId,
          quantity,
        },
        { withCredentials: true },
      );

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
    if (!user) return;

    try {
      const res = await axios.delete(
        `http://localhost:4000/cart/remove/${foodId}`,
        { withCredentials: true },
      );
      if (res.status === 200) {
        setCartItems(res.data.cartItems || []);
      }
    } catch (error) {
      console.error("❌ Failed to remove item from cart:", error);
    }
  };

  const createOrder = async () => {
    if (!user) return alert("Please login to place an order");

    if (cartItems.length === 0) return alert("Cart is empty");
    try {
      const res = await axios.post(
        "http://localhost:4000/order/create-order",
        { userId: user._id },
        { withCredentials: true },
      );
      if (res.status === 201) {
        fetchCart();
      } else {
        alert("❌ Failed to place order");
      }
    } catch (error) {
      console.error("❌ Failed to create order:", error);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <FoodContext.Provider
      value={{
        cartItems,
        fetchCart,
        checkUser,
        addToCart,
        removeCart,
        createOrder,
        user,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}
