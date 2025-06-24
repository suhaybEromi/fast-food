import { Link, useLocation } from "react-router-dom";
import FoodData from "./FoodData";
import BackHome from "./BackHome";
import CartIconWithCount from "./CartIconWithCount";
import imageIcon from "../assets/logo-food.png";

export default function Navbar({ category }) {
  const location = useLocation();
  const isCategoryPage = location.pathname !== "/";

  // Extract just the path, like '/pizza', '/burger', etc.
  const currentPath = location.pathname;

  return (
    <div>
      {isCategoryPage && <BackHome />}

      {/* Navigation bar with categories centered and cart icon right */}
      <div className="d-flex justify-content-between align-items-center px-5 mt-3">
        {/* Centered Category Links */}
        <img src={imageIcon} width="100px" />
        <div className="text-center flex-grow-1 d-flex justify-content-center">
          <Link to="/pizza" className="m-3 fs-5 text-decoration-none">
            <span
              className={
                currentPath === "/pizza" ? "text-primary" : "text-dark"
              }
            >
              Pizza
            </span>
          </Link>
          <Link to="/burger" className="m-3 fs-5 text-decoration-none">
            <span
              className={
                currentPath === "/burger" ? "text-primary" : "text-dark"
              }
            >
              Burger
            </span>
          </Link>
          <Link to="/drink" className="m-3 fs-5 text-decoration-none">
            <span
              className={
                currentPath === "/drink" ? "text-primary" : "text-dark"
              }
            >
              Drink
            </span>
          </Link>
        </div>

        {/* Cart Icon on the Right */}
        <div>
          <Link
            to="/cart"
            className="text-decoration-none text-secondary d-flex align-items-center"
          >
            {/* <FaShoppingCart size={24} /> */}
            <CartIconWithCount />
          </Link>
        </div>

        <div>
          <Link to="/signin">
            <button className="btn btn-outline-dark border border-1 border-dark rounded-3 ms-5">
              Sign In
            </button>
          </Link>
        </div>
      </div>

      {/* Optional: Banner or Section Title */}
      <FoodData selectedCategory={category} />
    </div>
  );
}
