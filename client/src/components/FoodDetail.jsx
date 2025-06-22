import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { Container, Spinner, Row, Col, Card, Button } from "react-bootstrap";
import axios from "axios";
import BackHome from "./BackHome";
import { FoodContext } from "../context/FoodContext";
import CartIconWithCount from "./CartIconWithCount";

export default function FoodDetail() {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(FoodContext);

  const detailFood = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/foods/food/${id}`,
      );
      setFood(response.data.food);
    } catch (error) {
      console.error("Error fetching food details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    detailFood();
  }, [id]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <div className="mt-3">Loading food details...</div>
      </Container>
    );
  }

  if (!food) {
    return <Container className="text-center my-5">Food not found</Container>;
  }

  return (
    <Container className="my-5">
      <BackHome />
      <div className="d-flex justify-content-end">
        <Link
          to="/cart"
          className="text-decoration-none text-secondary position-relative me-2"
        >
          <CartIconWithCount />
        </Link>
      </div>

      <Row className="justify-content-center mt-4">
        <Col md={8} lg={6}>
          <Card className="shadow rounded-4 p-4 border-0">
            {/* Image container with max height */}
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
              />
            </div>

            <Card.Body className="text-center">
              <Card.Title className="fs-3">{food.name}</Card.Title>
              <Card.Text className="text-muted">{food.description}</Card.Text>
              <h5 className="text-success mb-3">Price: {food.price}</h5>

              <div className="mt-4">
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => addToCart(food, 1)}
                >
                  Add to Cart
                </Button>
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
