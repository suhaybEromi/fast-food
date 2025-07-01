import { useContext } from "react";
import { FoodContext } from "../context/FoodContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { user, loadingUser } = useContext(FoodContext);

  if (loadingUser) return <div className="text-center mt-5">Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/signin" />;
}
