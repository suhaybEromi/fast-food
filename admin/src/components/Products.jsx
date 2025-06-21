import { Table, Card, Image, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { MdDeleteForever } from "react-icons/md";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Products() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayFood = async () => {
    try {
      const response = await axios.get("http://localhost:4000/foods/food");
      setFoods(response.data.foods);
    } catch (error) {
      console.error("Error fetching food data:", error);
      toast.error("❌ Failed to load food data.", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    displayFood();
  }, []);

  const handleDelete = async id => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this food item?",
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:4000/foods/delete/${id}`);
      setFoods(prevFoods => prevFoods.filter(food => food._id !== id));
      toast.success("✅ Food item deleted successfully!", {
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
    } catch (error) {
      console.error("Error deleting food item:", error);
      toast.error("❌ Failed to delete food item.", {
        position: "top-center",
        autoClose: 4000,
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
    <>
      {/* Toast container for notifications */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <div>Loading...</div>
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center my-5">No Food Available</div>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-4">Product List</h3>
            <Table striped bordered hover responsive>
              <thead className="table-dark text-center">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Price (IQD)</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Created At</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((product, index) => (
                  <tr key={product._id} className="align-middle text-center">
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.price.toLocaleString()} IQD</td>
                    <td
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={product.description}
                    >
                      {product.description}
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <Image
                        src={`http://localhost:4000/${product.imageUrl}`}
                        alt={product.name}
                        rounded
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>{new Date(product.createdAt).toLocaleString()}</td>
                    <td>
                      <MdDeleteForever
                        className="text-danger fs-4"
                        style={{ cursor: "pointer" }}
                        title="Delete"
                        onClick={() => handleDelete(product._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </>
  );
}
