import { useEffect, useState } from "react";
import { Card, Row, Col, Container, Spinner } from "react-bootstrap";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Banner({ selectedCategory }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayFood = async () => {
    try {
      const response = await axios.get("http://localhost:4000/foods/banner");
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
              <Card>
                <Card.Title>Name: {food.name}</Card.Title>
                <Link to={`/foods/${food._id}`}>
                  <Card.Img
                    variant="top"
                    src={`http://localhost:4000/${food.imageUrl}`}
                    style={{ maxWidth: "300px", borderRadius: "10px" }}
                    alt={food.name}
                  />
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
