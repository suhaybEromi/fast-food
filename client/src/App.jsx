import FoodPage from "./features/food/pages/FoodPage";
import { AuthProvider } from "./features/auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <FoodPage />
    </AuthProvider>
  );
}
