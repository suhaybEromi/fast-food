import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FoodTable from "../components/FoodTable";
import { getFoods, deleteFood } from "../../services/food.service";

const FoodList = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    setLoading(true);

    const data = await getFoods();

    setFoods(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm("Delete this food?")) return;

    await deleteFood(id);
    fetchFoods();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Food Management</h1>

          <p className="text-sm text-slate-500">
            Manage your restaurant products
          </p>
        </div>

        <Link
          to="/foods/add"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Add Food
        </Link>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          Loading foods...
        </div>
      ) : (
        <FoodTable foods={foods} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default FoodList;
