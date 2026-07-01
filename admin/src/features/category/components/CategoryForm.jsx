import { useState } from "react";
import { IMAGE_URL } from "../../services/api";

const CategoryForm = ({ onSubmit, initialData = {} }) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [status, setStatus] = useState(initialData.status || "active");
  const [image, setImage] = useState(null);

  const handleSubmit = e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("status", status);

    if (image) {
      formData.append("image", image);
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Category Title
        </label>
        <input
          type="text"
          placeholder="Example: Burgers"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Status
        </label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Category Image
        </label>

        {initialData.image && (
          <img
            src={`${IMAGE_URL}${initialData.image}`}
            alt={initialData.title}
            className="mb-3 h-24 w-24 rounded-lg border object-cover"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-700"
      >
        Save Category
      </button>
    </form>
  );
};

export default CategoryForm;
