import { Link } from "react-router-dom";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { IMAGE_URL } from "../../services/api";

const FoodTable = ({ foods = [], onDelete }) => {
  if (foods.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="font-semibold text-slate-500">No foods found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4 text-left">
                Image
              </th>
              <th className="px-6 py-4 text-left">
                Food
              </th>
              <th className="px-6 py-4 text-left">
                Category
              </th>
              <th className="px-6 py-4 text-left">
                Price
              </th>
              <th className="px-6 py-4 text-left">
                Stock
              </th>
              <th className="px-6 py-4 text-left">
                Status
              </th>
              <th className="px-6 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {foods.map(food => (
              <tr
                key={food._id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  {food.image ? (
                    <img
                      src={`${IMAGE_URL}${food.image}`}
                      alt={food.title}
                      className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      <ImageOff size={20} />
                    </div>
                  )}
                </td>

                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{food.title}</p>
                  <p className="max-w-xs truncate text-sm text-slate-500">
                    {food.description || "No description"}
                  </p>
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {food.category?.title || "No category"}
                </td>

                <td className="px-6 py-4 font-medium text-slate-900">
                  IQD {Number(food.price).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-slate-600">{food.stock}</td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      food.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {food.status || "inactive"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/foods/edit/${food._id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-600"
                    >
                      <Pencil size={15} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDelete(food._id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FoodTable;
