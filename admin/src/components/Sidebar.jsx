import { Nav } from "react-bootstrap";

export default function Sidebar() {
  return (
    <>
      <h4 className="mb-4">My Menu</h4>
      <Nav className="flex-column">
        <Nav.Link href="/product" className="text-white">
          Products
        </Nav.Link>
        <Nav.Link href="/add-product" className="text-white">
          Add Product
        </Nav.Link>
      </Nav>
    </>
  );
}
