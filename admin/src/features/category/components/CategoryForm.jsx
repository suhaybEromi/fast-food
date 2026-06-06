import { useState } from "react";

const CategoryForm = ({ onSubmit, initialData = {} }) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [image, setImage] = useState(null);

  const handleSubmit = e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);

    if (image) {
      formData.append("image", image);
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-xl space-y-5"
    >
      <div>
        <label className="block mb-2 text-sm font-semibold text-slate-700">
          Category Title
        </label>
        <input
          type="text"
          placeholder="Example: Electronics"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-slate-700">
          Category Image
        </label>

        {initialData.image && (
          <img
            src={`${import.meta.env.VITE_API_URL_IMG}${initialData.image}`}
            alt={initialData.title}
            className="mb-3 h-24 w-24 rounded-xl object-cover border"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        Save Category
      </button>
    </form>
  );
};

export default CategoryForm;
