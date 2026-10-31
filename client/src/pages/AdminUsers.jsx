
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUser, setUpdatingUser] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  // Get current logged-in admin
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data.users);
    } catch (err) {
      console.error("Users fetch error:", err);
      setError(
        err.response?.data?.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Promote or demote a user
  const handleRoleChange = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.name}'s role to ${newRole}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingUser(user._id);
      setActionMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/admin/users/${user._id}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((previousUsers) =>
        previousUsers.map((u) =>
          u._id === user._id
            ? { ...u, role: response.data.user.role }
            : u
        )
      );

      setActionMessage(response.data.message);
    } catch (err) {
      console.error("Role update error:", err);

      setActionMessage(
        err.response?.data?.message || "Failed to update user role."
      );
    } finally {
      setUpdatingUser(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = search.toLowerCase();

      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Management
          </h1>

          <p className="text-gray-500 mt-2">
            View and manage registered portal users.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
        >
          Refresh Users
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-gray-500 text-sm">Total Users</p>
          <h2 className="text-3xl font-bold mt-2">{users.length}</h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-gray-500 text-sm">Administrators</p>
          <h2 className="text-3xl font-bold mt-2 text-purple-600">
            {users.filter((u) => u.role === "admin").length}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-gray-500 text-sm">Regular Users</p>
          <h2 className="text-3xl font-bold mt-2 text-blue-600">
            {users.filter((u) => u.role === "user").length}
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border shadow-sm p-5 mb-6">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className="mb-5 rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-700">
          {actionMessage}
        </div>
      )}

      {/* User Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-lg">
            Registered Users ({filteredUsers.length})
          </h2>
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-500">
            Loading users...
          </p>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {error}
            <button
              onClick={fetchUsers}
              className="block mx-auto mt-3 text-blue-600 underline"
            >
              Try again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isCurrentUser =
                    currentUser?._id === user._id;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <span className="font-medium text-gray-800">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        {isCurrentUser ? (
                          <span className="text-xs text-gray-400">
                            Current account
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(user)}
                            disabled={updatingUser === user._id}
                            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                              user.role === "admin"
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-purple-600 hover:bg-purple-700"
                            }`}
                          >
                            {updatingUser === user._id
                              ? "Updating..."
                              : user.role === "admin"
                              ? "Demote"
                              : "Promote"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
