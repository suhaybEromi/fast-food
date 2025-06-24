import { forwardRef } from "react";
import { formatMoney } from "../utils/formatMoney";

const Receipt = forwardRef(({ cartItems, subtotal }, ref) => (
  <div
    ref={ref}
    style={{
      padding: "20px",
      fontFamily: "monospace",
      width: "300px",
      margin: "auto", // Center on page
    }}
  >
    <h2 style={{ textAlign: "center" }}>🧾 Fast Food</h2>
    <hr />
    {cartItems.map(item => (
      <div key={item._id} style={{ marginBottom: "10px" }}>
        <div>
          <strong>{item.foodId.name}</strong> x{item.quantity}
        </div>
        <div> {formatMoney(item.totalPrice)} IQD</div>
      </div>
    ))}
    <hr />
    <div style={{ textAlign: "right", fontWeight: "bold" }}>
      Total: IQD {formatMoney(subtotal)}
    </div>
  </div>
));

export default Receipt;
