import { Container } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function BackHome() {
  return (
    <Container>
      <div className="mt-3">
        <Link to="/" className="text-decoration-none text-dark">
          <FaArrowLeft className="me-2" />
          Back to Home Page
        </Link>
      </div>
    </Container>
  );
}
