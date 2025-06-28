import { useContext } from "react";
import { FoodContext } from "../context/FoodContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { user } = useContext(FoodContext);

  return user ? <Outlet /> : <Navigate to="/signin" />;
}
