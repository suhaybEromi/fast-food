import { useContext, useEffect, useRef, useState } from "react";
import { FoodContext } from "../context/FoodContext";
import { Table, Container, Button, Row, Col } from "react-bootstrap";
import BackHome from "./BackHome";
import { formatMoney } from "../utils/formatMoney";
import { MdDeleteForever } from "react-icons/md";
import Receipt from "./Receipt";

export default function Cart() {
  const { cartItems, fetchCart, removeCart, createOrder } =
    useContext(FoodContext);
  const [isPrinting, setIsPrinting] = useState(false);
  const receiptRef = useRef();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + parseFloat(item.totalPrice),
    0,
  );

  const handleOrder = () => {
    if (cartItems.length === 0) return;

    setIsPrinting(true);

    // Step 1: Wait for DOM to update
    setTimeout(() => {
      window.print(); // open print dialog
    }, 100);

    // Step 2: Handle after print
    const onPrintClose = async () => {
      const confirmOrder = window.confirm("Whether to print it or not?");
      if (confirmOrder) {
        await createOrder(); // Save to DB
        await fetchCart(); // Refresh cart (it will be empty)
      }
      setIsPrinting(false);
      window.onafterprint = null; // Clean up
    };

    window.onafterprint = onPrintClose;
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <Container className="my-5">
      <BackHome />

      {/* Only show receipt for printing */}
      {isPrinting && (
        <div className="print-only">
          <Receipt ref={receiptRef} cartItems={cartItems} subtotal={subtotal} />
        </div>
      )}

      {/* Your cart UI (will not show when printing) */}
      <div className="no-print">
        <h2 className="mb-4 mt-5 fw-bold">🛒 Your Cart</h2>
        <Table responsive bordered hover className="align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>Image</th>
              <th>Name</th>
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
                  <td>{formatMoney(item.foodId.price)} IQD</td>
                  <td>{item.quantity}</td>
                  <td>{formatMoney(item.totalPrice)} IQD</td>
                  <td>
                    <button
                      className="btn text-danger border-0 fs-4"
                      onClick={() => removeCart(item.foodId._id)}
                    >
                      <MdDeleteForever />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {cartItems.length > 0 && (
          <Row className="mt-5 justify-content-end">
            <Col md={4}>
              <div className="p-3 border rounded shadow-sm bg-light">
                <h5 className="fw-semibold">Cart Totals</h5>
                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <strong>{formatMoney(subtotal)} IQD</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Total</span>
                  <strong>{formatMoney(subtotal)} IQD</strong>
                </div>
                <Button
                  variant="warning"
                  className="w-100 mt-3 fw-semibold text-white"
                  onClick={handleOrder}
                >
                  Order & Print
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </div>
    </Container>
  );
}
