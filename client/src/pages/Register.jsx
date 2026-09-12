import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }
      );

      console.log("Registration successful:", response.data);

      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.status === 409) {
        setError(
          "An account with this email already exists. Please sign in instead."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to create your account."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Branding */}

        <div className="relative hidden overflow-hidden bg-slate-950 lg:flex">

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">

            <Link
              to="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg">
                <span className="text-lg font-bold">
                  F
                </span>
              </div>

              <div>
                <p className="text-lg font-bold text-white">
                  FindBack
                </p>

                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                  Lost & Found
                </p>
              </div>
            </Link>

            <div className="max-w-lg">

              <div className="mb-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
                Join the community
              </div>

              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white xl:text-6xl">
                Help items find their way home.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                Create an account to report lost items, share found
                belongings and help people reconnect with what they lost.
              </p>

              <div className="mt-8 space-y-4">

                {[
                  "Report lost and found items",
                  "Browse community reports",
                  "Connect with other users",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
                      ✓
                    </span>

                    <span className="text-sm text-slate-300">
                      {feature}
                    </span>
                  </div>
                ))}

              </div>

            </div>

            <p className="text-xs text-slate-500">
              Smart Lost & Found Portal
            </p>

          </div>

        </div>

        {/* Register */}

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}

            <Link
              to="/"
              className="mb-10 flex items-center justify-center gap-3 lg:hidden"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg">
                <span className="text-lg font-bold">
                  F
                </span>
              </div>

              <span className="text-xl font-bold text-slate-900">
                FindBack
              </span>

            </Link>

            <div className="mb-8">

              <p className="text-sm font-semibold text-indigo-600">
                Get started
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Join your community's lost and found network.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

              {/* Email */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

              {/* Password */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

              {/* Confirm Password */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account →"}
              </button>

            </form>

            {/* Login */}

            <div className="mt-8 text-center">

              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Sign in
                </Link>
              </p>

            </div>

            <div className="mt-8 rounded-xl bg-slate-100 px-4 py-3 text-center text-xs leading-5 text-slate-500">
              By creating an account, you can report and manage lost and
              found items within the platform.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;