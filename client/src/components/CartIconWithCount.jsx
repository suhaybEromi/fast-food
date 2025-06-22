import { useContext } from "react";
import { FoodContext } from "../context/FoodContext";
import { FaShoppingCart } from "react-icons/fa";
import { Badge } from "react-bootstrap";

export default function CartIconWithCount() {
  const { cartItems } = useContext(FoodContext);

  // Calculate total quantity of all items
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <FaShoppingCart size={28} color="#333" />
      {totalQuantity > 0 && (
        <Badge
          pill
          bg="danger"
          style={{
            position: "absolute",
            top: "-8px",
            right: "-10px",
            fontSize: "0.7rem",
          }}
        >
          {totalQuantity}
        </Badge>
      )}
    </div>
  );
}
