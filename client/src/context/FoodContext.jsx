import { createContext, useEffect, useState } from "react";
import { handleAxiosError } from "../utils/handleAxiosError";
import axiosInstance from "../api/axiosInstance";

export const FoodContext = createContext(null);

export default function FoodContextProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Signup user and fetch cart after signup
  const signup = async (username, email, password) => {
    try {
      const res = await axiosInstance.post(
        "/user/signup",
        { username, email, password },
        { withCredentials: true },
      );
      setUser(res.data.user);
      await fetchCart();
    } catch (err) {
      handleAxiosError(err);
      throw err;
    }
  };

  // Login user and fetch cart after login
  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post(
        "/user/login",
        { email, password },
        { withCredentials: true },
      );
      setUser(res.data.user);
      await fetchCart();
    } catch (err) {
      handleAxiosError(err);
      throw err;
    }
  };

  // Logout user and clear cart
  const logout = async () => {
    try {
      await axiosInstance.post("/user/logout", {}, { withCredentials: true });
      setUser(null);
      setCartItems([]);
    } catch (err) {
      handleAxiosError(err);
    }
  };

  // Fetch the current cart from server
  const fetchCart = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.get("/cart", {
        withCredentials: true,
      });
      setCartItems(res.data.cartItems || []);
    } catch (err) {
      handleAxiosError(err);
    }
  };

  const checkUser = async () => {
    setLoadingUser(true);
    try {
      const res = await axiosInstance.get("/user/check-user", {
        withCredentials: true,
      });

      setUser(res.data.user);
      await fetchCart(); // safe to call now
    } catch (err) {
      setUser(null);
      setCartItems([]);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    checkUser();
  }, []);

  // Add item to cart
  const addToCart = async (foodId, quantity = 1) => {
    if (!user) {
      handleAxiosError("Please login first to add items to your cart.");
      return;
    }

    try {
      const res = await axiosInstance.post(
        "/cart/add-to-cart",
        { userId: user._id, foodId, quantity },
        { withCredentials: true },
      );

      if (res.status === 200) {
        setCartItems(res.data.cartItems || []);
      } else {
        handleAxiosError(res.data.message || "Server returned an error.");
      }
    } catch (err) {
      handleAxiosError(err);
    }
  };

  // Remove item from cart
  const removeCart = async foodId => {
    if (!user) return;

    try {
      const res = await axiosInstance.delete(`/cart/remove/${foodId}`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setCartItems(res.data.cartItems || []);
      }
    } catch (err) {
      handleAxiosError(err);
    }
  };

  // Create order and clear cart
  const createOrder = async () => {
    if (!user) {
      handleAxiosError("Please login to place an order.");
      return;
    }

    if (cartItems.length === 0) {
      handleAxiosError("Cart is empty.");
      return;
    }

    try {
      const res = await axiosInstance.post(
        "/order/create-order",
        { userId: user._id },
        { withCredentials: true },
      );

      if (res.status === 201) {
        await fetchCart();
      } else {
        handleAxiosError("Failed to place order.");
      }
    } catch (err) {
      handleAxiosError(err);
    }
  };

  // useEffect(() => {
  //   checkUser();
  // }, []);

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
        loadingUser,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}
