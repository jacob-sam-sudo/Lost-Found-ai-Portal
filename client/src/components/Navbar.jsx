import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setNotificationOpen(false);
    navigate("/login");
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);

      const data = await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Count unread notifications
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Mark notification as read and open matched item
  const handleNotificationClick = async (
    notification
  ) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(
          notification._id
        );

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, read: true }
              : item
          )
        );
      }

      setNotificationOpen(false);

      if (notification.matchedItem?._id) {
        navigate(
          `/items/${notification.matchedItem._id}`
        );
      }
    } catch (error) {
      console.error(
        "Failed to update notification:",
        error
      );
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Failed to mark notifications as read:",
        error
      );
    }
  };

  const navClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "text-indigo-600"
        : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-200">
            <span className="text-lg font-bold">
              F
            </span>
          </div>

          <div className="hidden sm:block">
            <p className="text-lg font-bold tracking-tight text-slate-900">
              FindBack
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
              Lost & Found
            </p>
          </div>

        </Link>

        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-1 md:flex">

          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/explore" className={navClass}>
            Explore
          </NavLink>

          <NavLink to="/my-items" className={navClass}>
            My Items
          </NavLink>

          <NavLink to="/matches" className={navClass}>
  My Matches
</NavLink>

          {user?.role === "admin" && (
  <NavLink to="/admin" className={navClass}>
    Admin Panel
  </NavLink>
)}

          <NavLink
            to="/create-item"
            className="ml-3 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
          >
            + Report Item
          </NavLink>

        </nav>

        {/* Right Side */}

        <div className="hidden items-center gap-3 md:flex">

          {/* Notifications */}

          <div className="relative">

            <button
              type="button"
              onClick={() => {
                setNotificationOpen(
                  !notificationOpen
                );
                setProfileOpen(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              title="Notifications"
            >
              <span className="text-lg">
                🔔
              </span>

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}

            </button>

            {/* Notification Dropdown */}

            {notificationOpen && (
              <div className="absolute right-0 top-14 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Notifications
                    </p>

                    <p className="text-xs text-slate-500">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : "All caught up"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleMarkAllAsRead
                      }
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Mark all as read
                    </button>
                  )}

                </div>

                {/* Notification List */}

                <div className="max-h-[420px] overflow-y-auto">

                  {notificationLoading ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length ===
                    0 ? (
                    <div className="px-4 py-10 text-center">

                      <div className="mb-2 text-3xl">
                        🔔
                      </div>

                      <p className="text-sm font-medium text-slate-700">
                        No notifications
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        You'll see potential matches here.
                      </p>

                    </div>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <button
                          key={notification._id}
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className={`w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                            !notification.read
                              ? "bg-indigo-50/40"
                              : "bg-white"
                          }`}
                        >

                          <div className="flex gap-3">

                            {/* Icon */}

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                              🎯
                            </div>

                            {/* Content */}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p className="text-sm font-semibold text-slate-900">
                                  Potential Match Found
                                </p>

                                {!notification.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                                )}

                              </div>

                              <p className="mt-1 text-xs leading-5 text-slate-600">
                                {notification.message}
                              </p>

                              <div className="mt-2 flex items-center gap-2">

                                <span className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
                                  {
                                    notification.matchPercentage
                                  }
                                  %
                                </span>

                                <span className="text-[11px] text-slate-400">
                                  View possible match →
                                </span>

                              </div>

                            </div>

                          </div>

                        </button>
                      )
                    )
                  )}

                </div>

              </div>
            )}

          </div>

          {/* Profile */}

          <div className="relative">

            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100"
            >

              <div
                style={{
                  width: "38px",
                  height: "38px",
                  minWidth: "38px",
                  minHeight: "38px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#e0e7ff",
                }}
              >

                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "Profile"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <span className="font-semibold text-indigo-600">
                    {user?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </span>
                )}

              </div>

              <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 lg:block">
                {user?.name || "Account"}
              </span>

              <span className="text-xs text-slate-400">
                ▼
              </span>

            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">

                <div className="border-b border-slate-100 px-3 py-3">

                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.name}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user?.email}
                  </p>

                </div>

                <Link
                  to="/profile"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                >
                  My Profile
                </Link>

                <Link
                  to="/my-items"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="block rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                >
                  My Reports
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50"
                >
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

        {/* Mobile Menu Button */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(!mobileOpen)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 md:hidden"
        >
          <span className="text-xl">
            {mobileOpen ? "✕" : "☰"}
          </span>
        </button>

      </div>

      {/* Mobile Menu */}

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">

          <nav className="space-y-1">

            <NavLink
              to="/"
              onClick={() =>
                setMobileOpen(false)
              }
              className={navClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/explore"
              onClick={() =>
                setMobileOpen(false)
              }
              className={navClass}
            >
              Explore
            </NavLink>

            <NavLink
              to="/my-items"
              onClick={() =>
                setMobileOpen(false)
              }
              className={navClass}
            >
              My Items
            </NavLink>

            <NavLink
  to="/matches"
  onClick={() =>
    setMobileOpen(false)
  }
  className={navClass}
>
  My Matches
</NavLink>
            {user?.role === "admin" && (
  <NavLink
    to="/admin"
    onClick={() => setMobileOpen(false)}
    className={navClass}
  >
    Admin Panel
  </NavLink>
)}

            <NavLink
              to="/profile"
              onClick={() =>
                setMobileOpen(false)
              }
              className={navClass}
            >
              Profile
            </NavLink>

            <Link
              to="/create-item"
              onClick={() =>
                setMobileOpen(false)
              }
              className="mt-3 block rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              + Report an Item
            </Link>

            <button
              onClick={handleLogout}
              className="w-full rounded-xl px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
            >
              Logout
            </button>

          </nav>

        </div>
      )}

    </header>
  );
};

export default Navbar;