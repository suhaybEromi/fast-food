import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FoodForm from "../components/FoodForm";
import { getFoods, updateFood } from "../../services/food.service.js";

const EditFood = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await getFoods();

        const foods = res.data || [];

        const selectedFood = foods.find(item => item._id === id);

        setFood(selectedFood);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [id]);

  const handleUpdate = async formData => {
    await updateFood(id, formData);
    navigate("/foods");
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        Loading food...
      </div>
    );
  }

  if (!food) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-10 text-center font-semibold text-red-600">
        Food not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">Foods</p>
        <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
          Edit food
        </h1>
        <p className="mt-2 text-slate-500">Update food information.</p>
      </div>

      <FoodForm
        initialValues={food}
        onSubmit={handleUpdate}
        buttonText="Update Food"
      />
    </div>
  );
};

export default EditFood;
