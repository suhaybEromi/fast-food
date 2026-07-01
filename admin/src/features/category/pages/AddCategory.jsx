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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">
          Categories
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
          Add category
        </h1>
        <p className="mt-2 text-slate-500">Create a new menu group.</p>
      </div>

      <CategoryForm onSubmit={handleCreate} />
    </div>
  );
};

export default AddCategory;
