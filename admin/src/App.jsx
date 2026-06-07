import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "./components/dashboard/AdminLayout";
import Home from "./features/home/pages/Home";
import CategoryList from "./features/category/pages/CategoryList";
import AddCategory from "./features/category/pages/AddCategory";
import EditCategory from "./features/category/pages/EditCategory";
import FoodList from "./features/food/pages/FoodList";
import AddFood from "./features/food/pages/AddFood";
import EditFood from "./features/food/pages/EditFood";
import FoodTable from "./features/food/components/FoodTable";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          {/* Food */}
          <Route path="/" element={<FoodList />} />
          <Route path="/foods/add" element={<AddFood />} />
          <Route path="/foods/edit/:id" element={<EditFood />} />

          {/* Category */}
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/add" element={<AddCategory />} />
          <Route path="/categories/edit/:id" element={<EditCategory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
