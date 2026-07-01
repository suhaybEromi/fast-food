import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import CategoryTable from "../components/CategoryTable";
import { getCategories, deleteCategory } from "../../services/category.service";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async id => {
    const confirmDelete = globalThis.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) return;

    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCategories = categories.filter(category => {
    const search = query.trim().toLowerCase();
    const matchesSearch =
      !search ||
      category.title?.toLowerCase().includes(search) ||
      category.slug?.toLowerCase().includes(search);
    const matchesStatus = status === "all" || category.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-red-600">
            Categories
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
            Menu categories
          </h1>
          <p className="mt-2 text-slate-500">
            Organize foods into clean customer-facing groups.
          </p>
        </div>

        <Link
          to="/categories/add"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-red-700"
        >
          <Plus size={18} />
          Add Category
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <Search size={18} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search categories"
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
          Loading categories...
        </div>
      ) : (
        <CategoryTable
          categories={filteredCategories}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default CategoryList;
