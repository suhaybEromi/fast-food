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
import CouponList from "./features/coupon/pages/CouponList";
import BannerList from "./features/banner/pages/BannerList";
import AdminUserList from "./features/adminUser/pages/AdminUserList";
import AnalyticsPage from "./features/analytics/pages/AnalyticsPage";
import AuditLogPage from "./features/audit/pages/AuditLogPage";
import DeliveryZoneList from "./features/delivery/pages/DeliveryZoneList";
import DriverList from "./features/delivery/pages/DriverList";
import SecurityPage from "./features/security/pages/SecurityPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />

          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/foods" element={<FoodList />} />
              <Route path="/foods/add" element={<AddFood />} />
              <Route path="/foods/edit/:id" element={<EditFood />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/coupons" element={<CouponList />} />
              <Route path="/banners" element={<BannerList />} />
              <Route path="/admins" element={<AdminUserList />} />
              <Route path="/audit-logs" element={<AuditLogPage />} />
              <Route path="/delivery-zones" element={<DeliveryZoneList />} />
              <Route path="/drivers" element={<DriverList />} />
              <Route path="/security" element={<SecurityPage />} />
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
