import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "./components/dashboard/AdminLayout";

import Home from "./features/home/pages/Home";
import CategoryList from "./features/category/pages/CategoryList";
import AddCategory from "./features/category/pages/AddCategory";
import EditCategory from "./features/category/pages/EditCategory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/categories" element={<CategoryList />} />

          <Route path="/categories/add" element={<AddCategory />} />

          <Route path="/categories/edit/:id" element={<EditCategory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
