import { useContext, useState } from "react";
import { Form, Button, Card, Container, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FoodContext } from "../context/FoodContext";

export default function Login() {
  const { signup, login } = useContext(FoodContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isLogin && formData.username.trim() === "") {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setMessage("Login successfully!");
        navigate("/");
      } else {
        await signup(formData.username, formData.email, formData.password);
        setMessage("Signup successful. You can now login.");
        setIsLogin(true);
        setFormData({ username: "", email: "", password: "" });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0]?.msg || "Validation failed.");
      } else {
        setError(
          err.response?.data?.error || "An error occurred. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4 shadow">
        <h3 className="text-center mb-4">{isLogin ? "Login" : "Sign Up"}</h3>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter full name"
                required
                onChange={handleChange}
                value={formData.username}
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              required
              onChange={handleChange}
              value={formData.email}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              required
              onChange={handleChange}
              value={formData.password}
            />
          </Form.Group>
          <Button
            variant="dark"
            type="submit"
            className="w-100 text-white fw-bold"
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </Button>
        </Form>

        <div className="text-center mt-3">
          <Button
            variant="link"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
              setError("");
            }}
            className="text-decoration-none"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </Button>
        </div>
      </Card>
    </Container>
  );
}
