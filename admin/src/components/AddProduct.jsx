import axios from "axios";
import { useState } from "react";
import { Form, Button, Card, Row, Col, Container } from "react-bootstrap";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddProduct() {
  const [addProduct, setAddProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    category: "",
  });

  const handleChange = e => {
    const { name, value, files } = e.target;
    setAddProduct(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", addProduct.name);
    formData.append("price", addProduct.price);
    formData.append("description", addProduct.description);
    formData.append("image", addProduct.image);
    formData.append("category", addProduct.category);

    try {
      const response = await axios.post(
        "http://localhost:4000/foods/add-food",
        formData,
      );

      if (response.status === 201) {
        setAddProduct({
          name: "",
          price: "",
          description: "",
          image: null,
          category: "",
        });

        toast.success("✅ Product added successfully!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error("Add Product Error:", error);
      toast.error("❌ Failed to add product. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4">Add New Product</h3>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    value={addProduct.name}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price (IQD)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    placeholder="Enter price"
                    value={addProduct.price}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Enter product description"
                value={addProduct.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    placeholder="e.g., Pizza, Burger, Drink"
                    value={addProduct.category}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Product Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end">
              <Button type="submit" variant="dark">
                Add Product
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Toast container for notifications */}
      <ToastContainer />
    </Container>
  );
}
