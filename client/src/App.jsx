import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pizza" element={<Home category="pizza" />} />
          <Route path="/burger" element={<Home category="burger" />} />
          <Route path="/drink" element={<Home category="drink" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
