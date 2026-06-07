import { useNavigate } from "react-router-dom";
import FoodForm from "../components/FoodForm";
import { createFood } from "../../services/food.service.js";

const AddFood = () => {
  const navigate = useNavigate();

  const handleAdd = async formData => {
    await createFood(formData);
    navigate("/");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Add Food</h2>
        <p className="text-sm text-slate-500">
          Create a new food item for your menu.
        </p>
      </div>

      <FoodForm onSubmit={handleAdd} buttonText="Add Food" />
    </div>
  );
};

export default AddFood;
