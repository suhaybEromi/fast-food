import { Link, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // optional icon
import FoodData from "./FoodData";

export default function Home({ category }) {
  const location = useLocation();
  const isCategoryPage = location.pathname !== "/";

  return (
    <div>
      <div className="text-center mt-3 fs-5">
        {isCategoryPage && (
          <div className="ms-5 text-start">
            <Link to="/" className="text-decoration-none">
              <FaArrowLeft className="me-2 text-dark" />
              <span className="text-dark">Back to Home Page</span>
            </Link>
          </div>
        )}

        <Link to="/pizza" className="m-3">
          Pizza
        </Link>
        <Link to="/burger" className="m-3">
          Burger
        </Link>
        <Link to="/drink" className="m-3">
          Drink
        </Link>
      </div>

      <FoodData selectedCategory={category} />
    </div>
  );
}
