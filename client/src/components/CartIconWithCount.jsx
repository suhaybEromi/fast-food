import { useContext } from "react";
import { FoodContext } from "../context/FoodContext";
import { FaShoppingCart } from "react-icons/fa";
import Login from "../page/Login";

export default function CartIconWithCount() {
  const { cartItems } = useContext(FoodContext);

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="position-relative">
      <FaShoppingCart size={24} color="#333" />
      {totalCount > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{ fontSize: "0.75rem" }}
        >
          {totalCount}
        </span>
      )}
    </div>
  );
}
