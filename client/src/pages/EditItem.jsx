import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getItem,
  updateItem,
} from "../services/itemService";

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "lost",
    location: "",
    date: "",
  });

  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getItem(id);

      setFormData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        status: data.status || "lost",
        location: data.location || "",
        date: data.date
          ? new Date(data.date)
              .toISOString()
              .split("T")[0]
          : "",
      });

      setCurrentImage(data.image || "");
    } catch (err) {
      console.error("Error loading item:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load this item."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setNewImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("status", formData.status);
      data.append("location", formData.location);
      data.append("date", formData.date);

      if (newImage) {
        data.append("image", newImage);
      }

      await updateItem(id, data);

      navigate(`/items/${id}`);
    } catch (err) {
      console.error("Error updating item:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update this item."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="animate-pulse">

            <div className="mb-8 h-5 w-32 rounded bg-slate-200" />

            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">

              <div className="h-8 w-48 rounded bg-slate-200" />

              <div className="mt-8 space-y-6">

                <div className="h-12 rounded-xl bg-slate-200" />
                <div className="h-32 rounded-xl bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-4xl px-4 py-20 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-500">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Unable to load report
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            ← Go Back
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
        >
          ← Back
        </button>

        {/* Header */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-indigo-600">
            Manage Report
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Edit Item
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Update the information about your lost or found item.
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
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >

          <div className="space-y-8 p-6 sm:p-8">

            {/* Status */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Report Type
              </label>

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: "lost",
                    }))
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    formData.status === "lost"
                      ? "border-red-300 bg-red-50 text-red-600"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  🔴 Lost
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: "found",
                    }))
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    formData.status === "found"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  🟢 Found
                </button>

              </div>

            </div>

            {/* Title */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Item Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Black iPhone 15"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />

            </div>

            {/* Description */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe the item, its appearance and any identifying details..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />

            </div>

            {/* Category + Date */}

            <div className="grid gap-6 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="">
                    Select category
                  </option>
                  <option value="Electronics">
                    Electronics
                  </option>
                  <option value="Documents">
                    Documents
                  </option>
                  <option value="Clothing">
                    Clothing
                  </option>
                  <option value="Accessories">
                    Accessories
                  </option>
                  <option value="Books">
                    Books
                  </option>
                  <option value="Keys">
                    Keys
                  </option>
                  <option value="Bags">
                    Bags
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

            </div>

            {/* Location */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Where was it lost or found?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />

            </div>

            {/* Image */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Item Image
              </label>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                <div className="flex h-[260px] items-center justify-center overflow-hidden bg-slate-100">

                  {(imagePreview || currentImage) ? (

                    <img
                      src={imagePreview || currentImage}
                      alt="Item preview"
                      className="h-full w-full object-contain"
                    />

                  ) : (

                    <div className="text-center text-slate-400">

                      <div className="text-4xl">
                        📷
                      </div>

                      <p className="mt-2 text-sm">
                        No image
                      </p>

                    </div>

                  )}

                </div>

                <div className="border-t border-slate-200 bg-white p-4">

                  <label className="inline-flex cursor-pointer rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100">

                    Change Image

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                  </label>

                  <p className="mt-2 text-xs text-slate-400">
                    Leave unchanged to keep the current image.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Actions */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
};

export default EditItem;