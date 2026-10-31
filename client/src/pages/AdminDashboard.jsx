
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data.stats);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

const monthlyData = stats?.analytics?.monthly || [];

const itemDistribution = [
  { name: "Lost", value: stats?.items?.lost || 0 },
  { name: "Found", value: stats?.items?.found || 0 },
  { name: "Returned", value: stats?.items?.returned || 0 },
];

const matchDistribution = [
  { name: "Confirmed", value: stats?.matches?.confirmed || 0 },
  { name: "Rejected", value: stats?.matches?.rejected || 0 },
  { name: "Potential", value: stats?.matches?.potential || 0 },
];

const ITEM_COLORS = ["#F59E0B", "#10B981", "#6366F1"];
const MATCH_COLORS = ["#10B981", "#EF4444", "#F59E0B"];

  const StatCard = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-gray-900 mt-2">
        {value ?? 0}
      </h2>
      <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
  );

  const managementLinks = [
    {
      title: "User Management",
      description: "View registered users and manage administrator roles.",
      path: "/admin/users",
      icon: "👥",
      color: "bg-blue-50 text-blue-600",
      action: "Manage Users",
    },
    {
      title: "Item Management",
      description: "Review reported lost and found items and manage listings.",
      path: "/admin/items",
      icon: "📦",
      color: "bg-purple-50 text-purple-600",
      action: "Manage Items",
    },
    {
      title: "Match Management",
      description: "Monitor AI-generated matches and their current status.",
      path: "/admin/matches",
      icon: "🎯",
      color: "bg-green-50 text-green-600",
      action: "Manage Matches",
    },
    {

  title: "Activity Logs",
  description: "Monitor administrative actions and changes.",
  path: "/admin/activity-logs",
  icon: "📋",
  color: "bg-orange-50 text-orange-600",
  action: "View Activity Logs",
},
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>

        <button
          onClick={fetchStats}
          className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Monitor and manage your Lost & Found Portal.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition"
        >
          Refresh Statistics
        </button>
      </div>

      {/* User Statistics */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        User Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          description="Registered users"
        />
      </div>

      {/* Item Statistics */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Item Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Items"
          value={stats.items.total}
          description="All reported items"
        />
        <StatCard
          title="Lost Items"
          value={stats.items.lost}
          description="Items reported as lost"
        />
        <StatCard
          title="Found Items"
          value={stats.items.found}
          description="Items reported as found"
        />
        <StatCard
          title="Returned Items"
          value={stats.items.returned}
          description="Successfully returned items"
        />
      </div>

      {/* Match Statistics */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        AI Match Activity
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Matches"
          value={stats.matches.total}
          description="All match records"
        />
        <StatCard
          title="Potential Matches"
          value={stats.matches.potential}
          description="Awaiting confirmation or rejection"
        />
        <StatCard
          title="Confirmed Matches"
          value={stats.matches.confirmed}
          description="Matches confirmed by users"
        />
        <StatCard
          title="Rejected Matches"
          value={stats.matches.rejected}
          description="Matches rejected by users"
        />
      </div>


{/* Portal Analytics */}
<h2 className="text-lg font-semibold text-gray-800 mb-4">
  Portal Analytics
</h2>

{/* Monthly Item Trends */}
<div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-5">
    Monthly Item Reporting Trends
  </h3>

  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />

        <Line
          type="monotone"
          dataKey="lost"
          name="Lost Items"
          stroke="#F59E0B"
          strokeWidth={3}
        />

        <Line
          type="monotone"
          dataKey="found"
          name="Found Items"
          stroke="#10B981"
          strokeWidth={3}
        />

        <Line
          type="monotone"
          dataKey="returned"
          name="Returned Items"
          stroke="#6366F1"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Monthly User Registrations */}
<div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-5">
    Monthly User Registrations
  </h3>

  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <Tooltip />

        <Bar
          dataKey="users"
          name="New Users"
          fill="#3B82F6"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Distribution Charts */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

  {/* Item Distribution */}
  <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      Item Status Distribution
    </h3>

    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={itemDistribution}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={95}
            label
          >
            {itemDistribution.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={ITEM_COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Match Distribution */}
  <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      AI Match Outcomes
    </h3>

    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={matchDistribution}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={95}
            label
          >
            {matchDistribution.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={MATCH_COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>

</div>

{/* Match Success Rate */}
<div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-8">
  <h3 className="text-sm font-medium text-gray-500">
    Match Success Rate
  </h3>

  <p className="text-4xl font-bold text-green-600 mt-2">
    {stats?.matches?.successRate || 0}%
  </p>

  <p className="text-sm text-gray-500 mt-2">
    Confirmed matches as a percentage of all resolved matches.
  </p>
</div>


      {/* Management Navigation */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Portal Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {managementLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group bg-white rounded-xl border border-gray-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${item.color}`}>
              {item.icon}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-4">
              {item.title}
            </h3>

            <p className="text-sm text-gray-500 mt-2 min-h-10">
              {item.description}
            </p>

            <p className="mt-5 text-sm font-semibold text-indigo-600 group-hover:text-indigo-800">
              {item.action} →
            </p>
          </Link>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Portal Summary
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Registered Users</span>
            <span className="font-semibold">{stats.users.total}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Items Reported</span>
            <span className="font-semibold">{stats.items.total}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Items Returned</span>
            <span className="font-semibold text-green-600">
              {stats.items.returned}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Confirmed AI Matches</span>
            <span className="font-semibold text-blue-600">
              {stats.matches.confirmed}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
