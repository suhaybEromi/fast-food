import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import FoodDetail from "./components/FoodDetail";
import Navbar from "./components/Navbar";
import FoodContextProvider from "./context/FoodContext";
import Cart from "./components/Cart";
import Login from "./page/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <BrowserRouter>
        <FoodContextProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/foods/:id" element={<FoodDetail />} />
            <Route path="/pizza" element={<Navbar category="pizza" />} />
            <Route path="/burger" element={<Navbar category="burger" />} />
            <Route path="/drink" element={<Navbar category="drink" />} />

            <Route path="/cart" element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
            </Route>

            <Route path="/signin" element={<Login />} />
          </Routes>
          <ToastContainer position="top-left" autoClose={3000} />
        </FoodContextProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
