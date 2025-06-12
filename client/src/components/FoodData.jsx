import { useEffect, useState } from "react";
import { Card, Row, Col, Container, Button, Spinner } from "react-bootstrap";
import axios from "axios";

export default function FoodData({ selectedCategory }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayFood = async () => {
    try {
      const response = await axios.get("http://localhost:4000/foods/food");
      setFoods(response.data.foods);
    } catch (error) {
      console.error("Error fetching food data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    displayFood();
  }, []);

  const filteredFoods = selectedCategory
    ? foods.filter(
        food => food.category?.toLowerCase() === selectedCategory.toLowerCase(),
      )
    : foods;

  return (
    <Container className="mt-4">
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <div>Loading...</div>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center">No Food Available</div>
      ) : (
        <Row>
          {filteredFoods.map((food, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card style={{ width: "100%" }}>
                <Card.Img
                  variant="top"
                  src={`http://localhost:4000/${food.imageUrl}`}
                  alt={food.name}
                />
                <Card.Body>
                  <Card.Title>Name: {food.name}</Card.Title>
                  <Card.Text>Description: {food.description}</Card.Text>
                  <Card.Title>Price: {food.price}</Card.Title>
                  <Button variant="primary">Add To Cart</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
