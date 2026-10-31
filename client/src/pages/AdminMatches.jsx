
import { useEffect, useState } from "react";
import axios from "axios";

const AdminMatches = () => {
  const [matches, setMatches] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/matches",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { search, status },
        }
      );

      setMatches(response.data.matches || []);
    } catch (err) {
      console.error("Admin matches error:", err);
      setError(
        err.response?.data?.message || "Failed to load matches."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [search, status]);

  const statusStyle = (value) => {
    const styles = {
      potential: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      returned: "bg-blue-100 text-blue-700",
    };

    return styles[value] || "bg-gray-100 text-gray-700";
  };

  const MatchItem = ({ item, label }) => (
    <div className="flex items-center gap-3 min-w-64">
      {item?.image ? (
        <img
          src={item.image}
          alt={item.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
          No image
        </div>
      )}

      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-semibold text-gray-800">
          {item?.title || "Item unavailable"}
        </p>
        <p className="text-xs text-gray-500">
          {item?.owner?.name || "Unknown owner"}
        </p>
        <p className="text-xs text-gray-400">
          {item?.location || ""}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Match Management
          </h1>
          <p className="text-gray-500 mt-2">
            Monitor AI-generated matches across the portal.
          </p>
        </div>

        <button
          onClick={fetchMatches}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
        >
          Refresh Matches
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: matches.length, color: "text-gray-900" },
          {
            label: "Potential",
            value: matches.filter((m) => m.status === "potential").length,
            color: "text-yellow-600",
          },
          {
            label: "Confirmed",
            value: matches.filter((m) => m.status === "confirmed").length,
            color: "text-green-600",
          },
          {
            label: "Returned",
            value: matches.filter((m) => m.status === "returned").length,
            color: "text-blue-600",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border shadow-sm">
            <p className="text-sm text-gray-500">{stat.label} Matches</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search item title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="potential">Potential</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Match Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {matches.length} matches
      </p>

      {/* Match Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-10 text-center text-gray-500">
            Loading matches...
          </p>
        ) : error ? (
          <div className="p-10 text-center text-red-600">
            {error}
            <button
              onClick={fetchMatches}
              className="block mx-auto mt-3 text-blue-600 underline"
            >
              Retry
            </button>
          </div>
        ) : matches.length === 0 ? (
          <p className="p-10 text-center text-gray-500">
            No matches found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Lost Item",
                    "Found Item",
                    "AI Similarity",
                    "Match %",
                    "Status",
                    "Created",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {matches.map((match) => (
                  <tr key={match._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <MatchItem item={match.lostItem} label="Lost" />
                    </td>

                    <td className="px-6 py-4">
                      <MatchItem item={match.foundItem} label="Found" />
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {typeof match.similarity === "number"
                        ? `${(match.similarity * 100).toFixed(1)}%`
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {typeof match.matchPercentage === "number"
                        ? `${match.matchPercentage.toFixed(1)}%`
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                          match.status
                        )}`}
                      >
                        {match.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {match.createdAt
                        ? new Date(match.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMatches;
