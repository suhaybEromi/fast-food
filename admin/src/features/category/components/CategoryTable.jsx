import { Link } from "react-router-dom";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { IMAGE_URL } from "../../services/api";

const CategoryTable = ({ categories, onDelete }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
          <tr>
            <th className="px-5 py-4 text-left">Image</th>
            <th className="px-5 py-4 text-left">Title</th>
            <th className="px-5 py-4 text-left">Slug</th>
            <th className="px-5 py-4 text-left">Status</th>
            <th className="px-5 py-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map(category => (
            <tr key={category._id} className="border-t border-slate-100">
              <td className="px-5 py-4">
                {category.image ? (
                  <img
                    src={`${IMAGE_URL}${category.image}`}
                    alt={category.title}
                    className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-lg bg-slate-100 text-slate-400">
                    <ImageOff size={20} />
                  </div>
                )}
              </td>

              <td className="px-5 py-4 font-bold text-slate-900">
                {category.title}
              </td>

              <td className="px-5 py-4 text-slate-500">{category.slug}</td>

              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
                    category.status === "active"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-red-50 text-red-700 ring-1 ring-red-200"
                  }`}
                >
                  {category.status}
                </span>
              </td>

              <td className="px-5 py-4">
                <div className="flex gap-2">
                  <Link
                    to={`/categories/edit/${category._id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-600"
                  >
                    <Pencil size={15} />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => onDelete(category._id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan="5" className="py-10 text-center text-slate-500">
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default CategoryTable;
