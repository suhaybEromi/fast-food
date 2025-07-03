import { useContext, useEffect, useState } from "react";
import { Card, Row, Col, Container, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import { FoodContext } from "../context/FoodContext";
import { formatMoney } from "../utils/formatMoney";
import { handleAxiosError } from "../utils/handleAxiosError";

export default function FoodData({ selectedCategory }) {
  const { addToCart, user } = useContext(FoodContext);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState("");

  const displayFood = async () => {
    try {
      const response = await axios.get("http://localhost:4000/foods/food");
      setFoods(response.data.foods);

      const initialQuantities = {};
      response.data.foods.forEach(food => {
        initialQuantities[food._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      handleAxiosError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    displayFood();
  }, []);

  const handleAddToCart = food => {
    const quantity = quantities[food._id];
    addToCart(food._id, quantity);
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
      {/* Error Alert */}
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

      {/* Loading Spinner */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center my-5 flex-column">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Loading foods...</div>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center fs-5 text-muted mt-4">
          No Food Available
        </div>
      ) : (
        <Row className="g-4">
          {filteredFoods.map(food => (
            <Col key={food._id} xs={12} sm={6} md={4} lg={3}>
              <Card className="food-card h-100 rounded-4 shadow-sm border-0">
                <Link
                  to={`/foods/${food._id}`}
                  className="text-decoration-none"
                >
                  <div className="food-img-container">
                    <img
                      src={`http://localhost:4000/${food.imageUrl}`}
                      alt={food.name}
                      className="food-img"
                      crossOrigin="use-credentials"
                    />
                  </div>
                </Link>

                <Card.Body className="d-flex flex-column align-items-center text-center px-3">
                  <Card.Title className="fs-5 fw-semibold mb-1 text-dark">
                    {food.name}
                  </Card.Title>
                  <Card.Text className="text-success fw-bold fs-6 mb-3">
                    IQD {formatMoney(food.price * (quantities[food._id] || 1))}
                  </Card.Text>

                  {user && (
                    <>
                      <div className="d-flex align-items-center mb-3">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => changeQuantity(food._id, -1)}
                        >
                          −
                        </Button>
                        <span className="mx-3 fw-bold fs-6">
                          {quantities[food._id] || 1}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => changeQuantity(food._id, 1)}
                        >
                          +
                        </Button>
                      </div>

                      <Button
                        variant="dark"
                        className="w-100 fw-semibold rounded-3"
                        onClick={() => handleAddToCart(food)}
                      >
                        🍔 Add to Cart
                      </Button>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
