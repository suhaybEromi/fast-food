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
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [id]);

  const handleUpdate = async formData => {
    await updateFood(id, formData);
    navigate("/");
  };

  if (loading) {
    return <div className="p-6 text-slate-500">Loading food...</div>;
  }

  if (!food) {
    return <div className="p-6 text-red-500">Food not found.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Edit Food</h2>
        <p className="text-sm text-slate-500">Update food information.</p>
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
