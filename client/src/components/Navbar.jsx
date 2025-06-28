import { Link, useLocation, useNavigate } from "react-router-dom";
import FoodData from "./FoodData";
import BackHome from "./BackHome";
import CartIconWithCount from "./CartIconWithCount";
import imageIcon from "../assets/logo-food.png";
import { useContext } from "react";
import { FoodContext } from "../context/FoodContext";

export default function Navbar({ category }) {
  const { logout, user } = useContext(FoodContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isCategoryPage = location.pathname !== "/";
  const currentPath = location.pathname;

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <div>
      {isCategoryPage && <BackHome />}

      <div className="d-flex justify-content-between align-items-center px-5 mt-3">
        <img src={imageIcon} width="100px" />

        <div className="text-center flex-grow-1 d-flex justify-content-center">
          {["pizza", "burger", "drink"].map(cat => (
            <Link
              key={cat}
              to={`/${cat}`}
              className="m-3 fs-5 text-decoration-none"
            >
              <span
                className={
                  currentPath === `/${cat}` ? "text-primary" : "text-dark"
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            </Link>
          ))}
        </div>

        <div className="d-flex align-items-center">
          {user && (
            <Link
              to="/cart"
              className="text-decoration-none text-secondary d-flex align-items-center me-3"
            >
              <CartIconWithCount />
            </Link>
          )}

          {user ? (
            <button className="btn btn-danger rounded-3" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/signin">
              <button className="btn btn-outline-dark border border-1 border-dark rounded-3">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Pass `user` to control Add-to-Cart visibility */}
      <FoodData selectedCategory={category} user={user} />
    </div>
  );
}
