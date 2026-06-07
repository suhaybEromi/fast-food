import { Link } from "react-router-dom";

const FoodTable = ({ foods = [], onDelete }) => {
  if (foods.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">No foods found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Image
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Food
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
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
                      src={`${import.meta.env.VITE_API_URL_IMG}${food.image}`}
                      alt={food.title}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                      N/A
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
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => onDelete(food._id)}
                      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200"
                    >
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
