import { forwardRef } from "react";

const Receipt = forwardRef(({ cartItems, subtotal }, ref) => (
  <div
    ref={ref}
    style={{ padding: "20px", fontFamily: "monospace", width: "300px" }}
  >
    <h2 style={{ textAlign: "center" }}>🧾 Fast Food Receipt</h2>
    <hr />
    {cartItems.map(item => (
      <div key={item._id} style={{ marginBottom: "10px" }}>
        <strong>{item.foodId.name}</strong> x{item.quantity}
        <div>{item.totalPrice} IQD</div>
      </div>
    ))}
    <hr />
    <div>
      <strong>Total:</strong> {subtotal} IQD
    </div>
  </div>
));

export default Receipt;
