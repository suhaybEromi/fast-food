import { useEffect, useState } from "react";
import { Card, Row, Col, Container, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { Link } from "react-router-dom";

export default function FoodData({ selectedCategory }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const userId = "684dd36cef935e1523311a82";

  const displayFood = async () => {
    try {
      const response = await axios.get("http://localhost:4000/foods/food");
      setFoods(response.data.foods);

      const initialQuantities = {};
      response.data.foods.forEach(food => {
        initialQuantities[food._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("Error fetching food data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    displayFood();
  }, []);

  const handleAddToCart = async foodId => {
    const quantity = quantities[foodId];
    try {
      const response = await axios.post(
        "http://localhost:4000/cart/add-to-cart",
        {
          userId,
          foodId,
          quantity,
        },
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const changeQuantity = (foodId, amount) => {
    setQuantities(prev => ({
      ...prev,
      [foodId]: Math.max(1, (prev[foodId] || 1) + amount),
    }));
  };

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
              <Card className="shadow rounded-4 h-100">
                <div
                  className="text-center overflow-hidden rounded-top-4"
                  style={{
                    maxHeight: "200px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Link to={`/foods/${food._id}`}>
                    <img
                      src={`http://localhost:4000/${food.imageUrl}`}
                      alt={food.name}
                      style={{
                        maxHeight: "200px",
                        maxWidth: "100%",
                        objectFit: "contain",
                        padding: "10px",
                      }}
                    />
                  </Link>
                </div>

                <Card.Body className="text-center d-flex flex-column">
                  <Card.Title className="fs-5">{food.name}</Card.Title>
                  <Card.Text className="text-muted mb-2">
                    IQD {food.price}
                  </Card.Text>

                  {/* Quantity Controls */}
                  <div className="d-flex justify-content-center align-items-center mb-3">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => changeQuantity(food._id, -1)}
                    >
                      -
                    </Button>
                    <span className="px-2">{quantities[food._id] || 1}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="ms-2"
                      onClick={() => changeQuantity(food._id, 1)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-start">
                    <Button
                      variant="primary"
                      onClick={() => handleAddToCart(food._id)}
                    >
                      Add To Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
