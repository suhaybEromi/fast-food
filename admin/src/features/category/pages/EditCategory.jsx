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

  if (!category) return <p>Loading...</p>;

  return (
    <>
      <h1>Edit Category</h1>
      <CategoryForm onSubmit={handleUpdate} initialData={category} />
    </>
  );
};

export default EditCategory;
