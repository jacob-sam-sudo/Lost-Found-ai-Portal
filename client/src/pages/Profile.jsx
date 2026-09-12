import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  updateProfile,
  uploadAvatar,
} from "../services/userService";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");

  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || null
  );

  const [avatarFile, setAvatarFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setAvatarPreview(user?.avatar || null);
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage("");
    setError("");
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setAvatarLoading(true);
      setMessage("");
      setError("");

      const response = await uploadAvatar(avatarFile);

      const updatedUser =
        response?.user ||
        response?.data?.user ||
        response;

      if (updatedUser) {
        setUser(updatedUser);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        setAvatarPreview(updatedUser.avatar);
      }

      setAvatarFile(null);
      setMessage("Profile photo updated successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to upload profile photo."
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await updateProfile({
        name,
      });

      const updatedUser =
        response?.user ||
        response?.data?.user ||
        response;

      if (updatedUser) {
        setUser(updatedUser);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );
      }

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const initial =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
              👤
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
                Account
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                My Profile
              </h1>

            </div>

          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Manage your account information and profile photo.
          </p>

        </div>

      </section>

      {/* Main */}

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Profile Header Card */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_35%)]" />

          </div>

          <div className="px-6 pb-7 sm:px-8">

            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              {/* Avatar */}

              <div className="relative">

                <div
                  style={{
                    width: "112px",
                    height: "112px",
                    minWidth: "112px",
                    minHeight: "112px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e0e7ff",
                    border: "5px solid white",
                    boxShadow:
                      "0 8px 25px rgba(15, 23, 42, 0.12)",
                  }}
                >

                  {avatarPreview ? (

                    <img
                      src={avatarPreview}
                      alt={user?.name || "Profile"}
                      style={{
                        width: "100%",
                        height: "100%",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block",
                      }}
                    />

                  ) : (

                    <span className="text-4xl font-bold text-indigo-600">
                      {initial}
                    </span>

                  )}

                </div>

                <label className="absolute bottom-1 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-sm text-white shadow-md transition hover:bg-indigo-700">

                  📷

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />

                </label>

              </div>

              {/* User Name */}

              <div className="flex-1 sm:pb-1">

                <h2 className="text-2xl font-bold text-slate-900">
                  {user?.name || "User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {user?.email}
                </p>

              </div>

              {/* Upload Button */}

              {avatarFile && (

                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={avatarLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {avatarLoading
                    ? "Uploading..."
                    : "Save Photo"}
                </button>

              )}

            </div>

          </div>

        </div>

        {/* Messages */}

        {message && (

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>

        )}

        {error && (

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>

        )}

        {/* Profile Information */}

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">

            <h2 className="text-lg font-bold text-slate-900">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the information associated with your account.
            </p>

          </div>

          <form
            onSubmit={handleUpdateProfile}
            className="p-6 sm:p-8"
          >

            <div className="space-y-6">

              {/* Name */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

              {/* Email */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Your email address cannot be changed here.
                </p>

              </div>

            </div>

            <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
};

export default Profile;