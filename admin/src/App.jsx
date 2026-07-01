import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import AdminLayout from "./components/dashboard/AdminLayout";
import { AuthProvider, RequireAdmin } from "./features/auth/AuthContext";
import AuthPage from "./features/auth/pages/AuthPage";
import Home from "./features/home/pages/Home";
import CategoryList from "./features/category/pages/CategoryList";
import AddCategory from "./features/category/pages/AddCategory";
import EditCategory from "./features/category/pages/EditCategory";
import FoodList from "./features/food/pages/FoodList";
import AddFood from "./features/food/pages/AddFood";
import EditFood from "./features/food/pages/EditFood";
import OrderList from "./features/order/pages/OrderList";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          {/* <Route path="/signup" element={<AuthPage mode="signup" />} /> */}

          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              {/* Dashboard */}
              <Route path="/" element={<Home />} />

              {/* Food */}
              <Route path="/foods" element={<FoodList />} />
              <Route path="/foods/add" element={<AddFood />} />
              <Route path="/foods/edit/:id" element={<EditFood />} />

              {/* Orders */}
              <Route path="/orders" element={<OrderList />} />

              {/* Category */}
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/add" element={<AddCategory />} />
              <Route path="/categories/edit/:id" element={<EditCategory />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
