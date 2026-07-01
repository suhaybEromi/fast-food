import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import FoodTable from "../components/FoodTable";
import { getFoods, deleteFood } from "../../services/food.service";

const FoodList = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const fetchFoods = async () => {
    setLoading(true);

    try {
      const data = await getFoods();

      setFoods(data.data || []);
    } catch (error) {
      console.error(error);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleDelete = async id => {
    if (!globalThis.confirm("Delete this food?")) return;

    await deleteFood(id);
    fetchFoods();
  };

  const filteredFoods = foods.filter(food => {
    const search = query.trim().toLowerCase();
    const matchesSearch =
      !search ||
      food.title?.toLowerCase().includes(search) ||
      food.category?.title?.toLowerCase().includes(search);
    const matchesStatus = status === "all" || food.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-red-600">Foods</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
            Menu management
          </h1>

          <p className="mt-2 text-slate-500">
            Update availability, pricing, images, and categories.
          </p>
        </div>

        <Link
          to="/foods/add"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-red-700"
        >
          <Plus size={18} />
          Add Food
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <Search size={18} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search foods or categories"
            className="w-full bg-transparent text-slate-800 outline-none"
          />
        </label>

        <div className="grid grid-cols-3 gap-2 sm:flex">
          {["all", "active", "inactive"].map(option => (
            <button
              type="button"
              key={option}
              onClick={() => setStatus(option)}
              className={`rounded-lg px-4 py-2 text-sm font-black capitalize transition ${
                status === option
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading foods...
        </div>
      ) : (
        <FoodTable foods={filteredFoods} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default FoodList;
