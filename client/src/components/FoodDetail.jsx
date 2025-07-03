import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { Container, Spinner, Row, Col, Card, Button } from "react-bootstrap";
import axios from "axios";
import BackHome from "./BackHome";
import { FoodContext } from "../context/FoodContext";
import CartIconWithCount from "./CartIconWithCount";
import { formatMoney } from "../utils/formatMoney";
import { handleAxiosError } from "../utils/handleAxiosError";

export default function FoodDetail() {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, user } = useContext(FoodContext);
  const [error, setError] = useState("");

  const detailFood = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/foods/food/${id}`,
      );
      setFood(response.data.food);
    } catch (err) {
      handleAxiosError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    detailFood();
  }, [id]);

  const handleAddToCart = async () => {
    setError("");
    try {
      await addToCart(food._id, 1);
    } catch (err) {
      handleAxiosError(err, setError);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <div className="mt-3">Loading...</div>
      </Container>
    );
  }

  if (!food) {
    return <Container className="text-center my-5">Food not found</Container>;
  }

  return (
    <Container className="my-5">
      <BackHome />

      {error && (
        <div
          style={{
            backgroundColor: "#ffe0e0",
            color: "#a30000",
            border: "1px solid #f5c2c7",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {user && (
        <div className="d-flex justify-content-end">
          <Link
            to="/cart"
            className="text-decoration-none text-secondary position-relative me-2"
          >
            <CartIconWithCount />
          </Link>
        </div>
      )}

      <Row className="justify-content-center mt-4">
        <Col md={8} lg={6}>
          <Card className="shadow rounded-4 p-4 border-0">
            <div
              className="rounded-4 overflow-hidden mb-3 text-center"
              style={{
                maxHeight: "200px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={`http://localhost:4000/${food.imageUrl}`}
                alt={food.name}
                style={{
                  maxHeight: "200px",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
                crossOrigin="use-credentials"
              />
            </div>

            <Card.Body className="text-center">
              <Card.Title className="fs-3">{food.name}</Card.Title>
              <Card.Text className="text-muted">{food.description}</Card.Text>
              <h5 className="mb-3">IQD {formatMoney(food.price || 1)}</h5>

              <div className="mt-4 d-flex justify-content-center gap-3">
                {user && (
                  <Button
                    variant="primary"
                    onClick={handleAddToCart}
                    disabled={loading || !!error}
                  >
                    Add to Cart
                  </Button>
                )}
                <Link to="/" className="btn btn-outline-secondary">
                  Back
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
