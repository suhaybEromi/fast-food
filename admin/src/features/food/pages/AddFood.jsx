import { useNavigate } from "react-router-dom";
import FoodForm from "../components/FoodForm";
import { createFood } from "../../services/food.service.js";

const AddFood = () => {
  const navigate = useNavigate();

  const handleAdd = async formData => {
    await createFood(formData);
    navigate("/foods");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">Foods</p>
        <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
          Add food
        </h1>
        <p className="mt-2 text-slate-500">
          Create a new food item for your menu.
        </p>
      </div>

      <FoodForm onSubmit={handleAdd} buttonText="Add Food" />
    </div>
  );
};

export default AddFood;
