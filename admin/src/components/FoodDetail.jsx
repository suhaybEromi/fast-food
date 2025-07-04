import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Container, Spinner, Row, Col, Card, Button } from "react-bootstrap";
import axios from "axios";
import { formatMoney } from "../utils/formatMoney";

export default function FoodDetail() {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <Button
        as={Link}
        to="/product"
        variant="outline-secondary"
        className="mb-4"
      >
        ← Back to Products
      </Button>

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
                crossOrigin="use-credentials"
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
              <h5 className="mb-3">IQD {formatMoney(food.price || 1)}</h5>
              <Card.Text>
                <strong>Category:</strong> {food.category}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
