import { useContext, useEffect } from "react";
import { FoodContext } from "../context/FoodContext";
import { Card, ListGroup, Badge, Button } from "react-bootstrap";
import BackHome from "./BackHome";

export default function Cart() {
  const { cartItems, fetchCart } = useContext(FoodContext);

  useEffect(() => {
    fetchCart();
  }, []);

  const grandTotal = cartItems.reduce((acc, item) => {
    return acc + parseFloat(item.totalPrice);
  }, 0);

  return (
    <>
      <BackHome />
      <div className="d-flex justify-content-center mt-4">
        <Card
          style={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Card.Header
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <h5 className="mb-0">🛒 Your Cart</h5>
          </Card.Header>

          <ListGroup variant="flush">
            {cartItems.length === 0 ? (
              <ListGroup.Item className="text-center text-muted">
                Your cart is empty.
              </ListGroup.Item>
            ) : (
              cartItems.map(item => (
                <ListGroup.Item key={item._id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{item.foodId.name}</h6>
                      <small className="text-muted">
                        Price: {item.foodId.price} IQD
                        <br />
                        Qty: {item.quantity}
                      </small>
                    </div>
                    <div className="text-end">
                      <Badge
                        bg="success"
                        pill
                        style={{ fontSize: "1rem", padding: "0.5em 0.75em" }}
                      >
                        {parseFloat(item.totalPrice).toFixed(3)} IQD
                      </Badge>
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>

          {cartItems.length > 0 && (
            <Card.Footer
              className="d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "#fafafa" }}
            >
              <strong>Total</strong>
              <span style={{ fontSize: "1.1rem", color: "#198754" }}>
                {grandTotal.toFixed(3)} IQD
              </span>
            </Card.Footer>
          )}
        </Card>
      </div>

      {cartItems.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <Button
            variant="primary"
            size="lg"
            style={{ padding: "10px 30px", borderRadius: "12px" }}
          >
            🧾 Order Now
          </Button>
        </div>
      )}
    </>
  );
}
