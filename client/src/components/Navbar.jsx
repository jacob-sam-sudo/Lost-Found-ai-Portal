import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
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

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            title="Notifications"
          >
            <span className="text-lg">
              🔔
            </span>

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* Profile */}

          <div className="relative">

            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
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
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}

              </div>

              <span className="hidden lg:block max-w-[120px] truncate text-sm font-medium text-slate-700">
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
                  onClick={() => setProfileOpen(false)}
                  className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                >
                  My Profile
                </Link>

                <Link
                  to="/my-items"
                  onClick={() => setProfileOpen(false)}
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
          onClick={() => setMobileOpen(!mobileOpen)}
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
              onClick={() => setMobileOpen(false)}
              className={navClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/explore"
              onClick={() => setMobileOpen(false)}
              className={navClass}
            >
              Explore
            </NavLink>

            <NavLink
              to="/my-items"
              onClick={() => setMobileOpen(false)}
              className={navClass}
            >
              My Items
            </NavLink>

            <NavLink
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className={navClass}
            >
              Profile
            </NavLink>

            <Link
              to="/create-item"
              onClick={() => setMobileOpen(false)}
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