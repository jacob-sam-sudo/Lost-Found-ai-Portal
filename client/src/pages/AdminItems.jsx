
import { useEffect, useState } from "react";
import axios from "axios";

const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/items",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search,
            status,
          },
        }
      );

      setItems(response.data.items || []);
    } catch (err) {
      console.error("Failed to fetch admin items:", err);
      setError(
        err.response?.data?.message || "Failed to load items."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, status]);

  // Delete item
  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?\n\nThis will also delete its related matches and notifications. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/admin/items/${item._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems((currentItems) =>
        currentItems.filter(
          (currentItem) => currentItem._id !== item._id
        )
      );

      setMessage(`"${item.title}" was deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError(
        err.response?.data?.message || "Failed to delete item."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const statusStyle = (itemStatus) => {
    switch (itemStatus) {
      case "lost":
        return "bg-red-100 text-red-700";
      case "found":
        return "bg-green-100 text-green-700";
      case "returned":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Item Management
          </h1>
          <p className="mt-2 text-gray-500">
            View and manage all lost and found item reports.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search by title, description or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 sm:flex-1"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              onClick={fetchItems}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Item Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{items.length}</span> items
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading items...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
            No items found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Item",
                      "Owner",
                      "Category",
                      "Location",
                      "Date",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                              No image
                            </div>
                          )}

                          <span className="font-medium text-gray-900">
                            {item.title}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.owner?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.owner?.email || ""}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {item.category}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {item.location}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Delete Action */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item._id}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === item._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminItems;
