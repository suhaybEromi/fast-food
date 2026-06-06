import { useNavigate } from "react-router-dom";
import CategoryForm from "../components/CategoryForm";
import { createCategory } from "../../services/category.service";

const AddCategory = () => {
  const navigate = useNavigate();

  const handleCreate = async values => {
    try {
      await createCategory(values);
      navigate("/categories");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Add Category</h1>
        <p className="mt-1 text-slate-500">Create a new category</p>
      </div>

      <CategoryForm onSubmit={handleCreate} />
    </div>
  );
};

export default AddCategory;
