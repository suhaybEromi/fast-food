import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CategoryForm from "../components/CategoryForm";
import { getCategories, updateCategory } from "../../services/category.service";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      const res = await getCategories();
      const foundCategory = res.data.find(item => item._id === id);
      setCategory(foundCategory);
    };

    fetchCategory();
  }, [id]);

  const handleUpdate = async values => {
    await updateCategory(id, values);
    navigate("/categories");
  };

  if (!category) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        Loading category...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">
          Categories
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
          Edit category
        </h1>
        <p className="mt-2 text-slate-500">
          Update the category name, status, and image.
        </p>
      </div>
      <CategoryForm onSubmit={handleUpdate} initialData={category} />
    </div>
  );
};

export default EditCategory;
