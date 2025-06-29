import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Products from "./components/Products";
import AddProduct from "./components/AddProduct";
import { Container, Row, Col } from "react-bootstrap";
import FoodDetail from "./components/FoodDetail";

function App() {
  return (
    <BrowserRouter>
      <Container fluid>
        <Row>
          <Col md={2} className="bg-dark text-white min-vh-100 p-3">
            <Sidebar />
          </Col>

          <Col md={10} className="p-4">
            <Routes>
              <Route
                path="/"
                element={<div>Welcome! Choose a menu item.</div>}
              />
              <Route path="/product" element={<Products />} />
              <Route path="/foods/:id" element={<FoodDetail />} />
              <Route path="/add-product" element={<AddProduct />} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </BrowserRouter>
  );
}

export default App;
