import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import FoodDetail from "./components/FoodDetail";
import Navbar from "./components/Navbar";
import FoodContextProvider from "./context/FoodContext";
import Cart from "./components/Cart";

function App() {
  return (
    <>
      <FoodContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/foods/:id" element={<FoodDetail />} />
            <Route path="/pizza" element={<Navbar category="pizza" />} />
            <Route path="/burger" element={<Navbar category="burger" />} />
            <Route path="/drink" element={<Navbar category="drink" />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </BrowserRouter>
      </FoodContextProvider>
    </>
  );
}

export default App;
