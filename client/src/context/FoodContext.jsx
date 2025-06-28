import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const FoodContext = createContext(null);

export default function FoodContextProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [userId] = useState("6856ac982fc5014bfb4cfb1c"); // replace with real user id

  // const signup = async (username, email, password) => {
  //   try {
  //     const res = await axios.post(
  //       "http://localhost:4000/user/signup",
  //       {
  //         username,
  //         email,
  //         password,
  //       },
  //       { withCredentials: true },
  //     );
  //     setUser(res.data.user);
  //     await fetchCart();
  //   } catch (err) {
  //     console.error("❌ Signup error:", err);
  //   }
  // };

  // const login = async (email, password) => {
  //   try {
  //     const res = await axios.post(
  //       "http://localhost:4000/user/login",
  //       { email, password },
  //       { withCredentials: true },
  //     );
  //     setUser(res.data.user);
  //     await fetchCart();
  //   } catch (error) {
  //     console.error("❌ Login error:", error);
  //   }
  // };

  // const logout = async () => {
  //   const navigate = useNavigate();
  //   try {
  //     await axios.post(
  //       "http://localhost:4000/user/logout",
  //       {},
  //       { withCredentials: true },
  //     );
  //     setUser(null);
  //     setCartItems([]);
  //     navigate("/signin");
  //   } catch (error) {
  //     console.error("❌ Logout error:", error);
  //   }
  // };

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
        await fetchCart(); // refresh cart after removal
      }
    } catch (error) {
      console.error("❌ Failed to remove item from cart:", error);
    }
  };

  const createOrder = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");
    try {
      const res = await axios.post("http://localhost:4000/order/create-order", {
        userId,
      });
      if (res.status === 201) {
        fetchCart(); // clear cart after order
      } else {
        console.error("⚠️ Server returned error:", res.data.message);
      }
    } catch (error) {
      console.error("❌ Failed to create order:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <FoodContext.Provider
      value={{
        cartItems,
        addToCart,
        fetchCart,
        removeCart,
        createOrder,
        userId,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}
