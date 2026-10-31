
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/activity-logs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLogs(response.data.logs || []);
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
      setError(
        err.response?.data?.message || "Failed to load activity logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;

      const searchText = search.toLowerCase();

      const matchesSearch = [
        log.targetName,
        log.details,
        log.admin?.name,
        log.admin?.email,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

      return matchesAction && matchesSearch;
    });
  }, [logs, search, actionFilter]);

  const getActionStyle = (action) => {
    switch (action) {
      case "USER_PROMOTED":
        return "bg-green-100 text-green-700";
      case "USER_DEMOTED":
        return "bg-orange-100 text-orange-700";
      case "ITEM_DELETED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case "USER_PROMOTED":
        return "User Promoted";
      case "USER_DEMOTED":
        return "User Demoted";
      case "ITEM_DELETED":
        return "Item Deleted";
      default:
        return action;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading activity logs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Activity Logs
          </h1>
          <p className="mt-2 text-gray-500">
            Monitor administrative actions performed on the portal.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Activities</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {logs.length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">User Role Changes</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {logs.filter((log) =>
                ["USER_PROMOTED", "USER_DEMOTED"].includes(log.action)
              ).length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Items Deleted</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {logs.filter((log) => log.action === "ITEM_DELETED").length}
            </h2>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm md:flex-row">
          <input
            type="text"
            placeholder="Search by target, admin or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
          />

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border px-4 py-2 outline-none focus:border-blue-500 md:w-64"
          >
            <option value="all">All Activities</option>
            <option value="USER_PROMOTED">User Promoted</option>
            <option value="USER_DEMOTED">User Demoted</option>
            <option value="ITEM_DELETED">Item Deleted</option>
          </select>

          <button
            onClick={fetchActivityLogs}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Activity Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4">Action</th>
                  <th className="whitespace-nowrap px-5 py-4">Admin</th>
                  <th className="whitespace-nowrap px-5 py-4">Target</th>
                  <th className="min-w-64 px-5 py-4">Details</th>
                  <th className="whitespace-nowrap px-5 py-4">Date & Time</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionStyle(
                            log.action
                          )}`}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {log.admin?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.admin?.email || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {log.targetName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.targetType}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {log.details || "No additional details"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t px-5 py-4 text-sm text-gray-500">
            Showing {filteredLogs.length} of {logs.length} activities
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogs;
