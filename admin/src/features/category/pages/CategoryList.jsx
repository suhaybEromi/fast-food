import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import CategoryTable from "../components/CategoryTable";
import { getCategories, deleteCategory } from "../../services/category.service";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async id => {
    const confirmDelete = window.confirm(
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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-slate-500">Manage your store categories</p>
        </div>

        <Link
          to="/categories/add"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Add Category
        </Link>
      </div>

      <CategoryTable categories={categories} onDelete={handleDelete} />
    </div>
  );
};

export default CategoryList;
