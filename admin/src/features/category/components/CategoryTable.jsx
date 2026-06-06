import { Link } from "react-router-dom";

const CategoryTable = ({ categories, onDelete }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse">
        <thead className="bg-slate-50">
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
                <img
                  src={
                    category.image
                      ? `${import.meta.env.VITE_API_URL_IMG}${category.image}`
                      : "/placeholder.png"
                  }
                  alt={category.title}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              </td>

              <td className="px-5 py-4">{category.title}</td>

              <td className="px-5 py-4">{category.slug}</td>

              <td
                className={`px-5 py-4 ${
                  category.status === "active"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {category.status}
              </td>

              <td className="px-5 py-4">
                <div className="flex gap-2">
                  <Link
                    to={`/categories/edit/${category._id}`}
                    className="rounded-lg bg-indigo-50 px-3 py-2 text-indigo-600"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => onDelete(category._id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan="4" className="py-10 text-center">
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
