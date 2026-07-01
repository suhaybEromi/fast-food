import { useEffect, useState } from "react";
import { getCategories } from "../../services/category.service";

const FoodForm = ({ initialValues = {}, onSubmit, buttonText }) => {
  const [form, setForm] = useState({
    title: initialValues.title || "",
    description: initialValues.description || "",
    category: initialValues.category?._id || initialValues.category || "",
    price: initialValues.price || "",
    stock: initialValues.stock || "",
    status: initialValues.status || "active",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (image) {
      formData.append("image", image);
    }

    await onSubmit(formData);
    setLoading(false);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getCategories();

      setCategories(res.data || res || []);
    };

    fetchCategories();
  }, []);

  const inputStyle =
    "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Food Title
          </label>
          <input
            className={inputStyle}
            name="title"
            placeholder="Burger"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Category
          </label>
          <select
            className={inputStyle}
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>

            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Price
          </label>
          <input
            className={inputStyle}
            name="price"
            type="number"
            placeholder="10"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Stock
          </label>
          <input
            className={inputStyle}
            name="stock"
            type="number"
            placeholder="50"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Status
          </label>
          <select
            className={inputStyle}
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Image
          </label>
          <input
            className={inputStyle}
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Description
        </label>
        <textarea
          className={`${inputStyle} min-h-32 resize-none`}
          name="description"
          placeholder="Food description..."
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-red-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {loading ? "Saving..." : buttonText}
        </button>
      </div>
    </form>
  );
};

export default FoodForm;
