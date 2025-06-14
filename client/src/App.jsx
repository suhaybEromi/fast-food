import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import FoodDetail from "./components/FoodDetail";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/foods/:id" element={<FoodDetail />} />
          <Route path="/pizza" element={<Navbar category="pizza" />} />
          <Route path="/burger" element={<Navbar category="burger" />} />
          <Route path="/drink" element={<Navbar category="drink" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
