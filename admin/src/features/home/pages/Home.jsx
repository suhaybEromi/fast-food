import { Link } from "react-router-dom";

export default function Home() {
  const products = [
    {
      id: 1,
      title: "Wireless Headphones",
      description: "High quality bluetooth headphones",
      price: 20000,
      stock: 24,
      image: "https://via.placeholder.com/80",
      status: "Active",
      category: "Electronics",
    },
    {
      id: 2,
      title: "Running Shoes",
      description: "Comfortable shoes for daily running",
      price: 15000,
      stock: 12,
      image: "https://via.placeholder.com/80",
      status: "Active",
      category: "Fashion",
    },
    {
      id: 3,
      title: "Coffee Mug",
      description: "Minimal ceramic coffee mug",
      price: 10000,
      stock: 0,
      image: "https://via.placeholder.com/80",
      status: "In active",
      category: "Home",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-slate-500">Manage your store products</p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/categories"
            className="rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-300"
          >
            Categories
          </Link>

          <Link
            to="/categories/add"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Add Category
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-500">
                Image
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-500 line-clamp-1">
                Title
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-500 line-clamp-2">
                Description
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-500">
                Price
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-500">
                Stock
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-500">
                Status
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-500">
                Category
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map(product => (
              <tr
                key={product.id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-14 w-14 rounded-xl bg-slate-100 object-cover"
                  />
                </td>

                <td className="px-5 py-4 font-medium text-slate-800">
                  {product.title}
                </td>

                <td className="px-5 py-4 text-slate-500">
                  {product.description}
                </td>

                <td className="px-5 py-4 font-semibold text-slate-800">
                  IQD {product.price.toLocaleString()}
                </td>

                <td className="px-5 py-4 text-slate-600">{product.stock}</td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      product.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-slate-600">{product.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
