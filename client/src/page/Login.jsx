import { useState } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4 shadow">
        <h3 className="text-center mb-4">{isLogin ? "Login" : "Sign Up"}</h3>
        <Form>
          {!isLogin && (
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter full name"
                required
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
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              required
            />
          </Form.Group>
          <Button
            variant="dark"
            type="submit"
            className="w-100 text-white fw-bold"
          >
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </Form>
        <div className="text-center mt-3">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
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
