import { useContext, useEffect } from "react";
import { FoodContext } from "../context/FoodContext";
import { Table, Container, Button, Row, Col, Form } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import BackHome from "./BackHome";

export default function Cart() {
  const { cartItems, fetchCart } = useContext(FoodContext);

  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + parseFloat(item.totalPrice),
    0,
  );
  const deliveryFee = 5;
  const total = subtotal + deliveryFee;

  return (
    <Container className="my-5">
      <BackHome />
      <h2 className="mb-4 mt-5 fw-bold">🛒 Your Cart</h2>

      {/* Cart Table */}
      <Table responsive bordered hover className="align-middle text-center">
        <thead className="table-light">
          <tr>
            <th>Items</th>
            <th>Title</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.length === 0 ? (
            <tr>
              <td colSpan="6">Your cart is empty</td>
            </tr>
          ) : (
            cartItems.map(item => (
              <tr key={item._id}>
                <td>
                  <img
                    src={`http://localhost:4000/${item.foodId.imageUrl}`}
                    alt={item.foodId.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{item.foodId.name}</td>
                <td>{item.foodId.price} IQD</td>
                <td>{item.quantity}</td>
                <td>{parseFloat(item.totalPrice).toFixed(3)} IQD</td>
                <td>
                  <Button variant="danger" size="sm">
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Cart Summary Section */}
      {cartItems.length > 0 && (
        <Row className="mt-5 justify-content-between">
          <Col md={6}>
            <Form className="d-flex gap-2">
              <Form.Control type="text" placeholder="promo code" />
              <Button variant="dark">Submit</Button>
            </Form>
          </Col>

          <Col md={4}>
            <div className="p-3 border rounded shadow-sm bg-light">
              <h5 className="fw-semibold">Cart Totals</h5>
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <strong>{subtotal.toFixed(3)} IQD</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Delivery Fee</span>
                <strong>{deliveryFee.toFixed(3)} IQD</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Total</span>
                <strong>{total.toFixed(3)} IQD</strong>
              </div>
              <Button
                variant="warning"
                className="w-100 mt-3 fw-semibold text-white"
              >
                PROCEED TO CHECKOUT
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}
