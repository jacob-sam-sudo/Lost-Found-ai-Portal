import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../services/itemService";

const CreateItem = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "lost",
    location: "",
    date: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("status", formData.status);
      data.append("location", formData.location);
      data.append("date", formData.date);

      if (formData.image) {
        data.append("image", formData.image);
      }

      await createItem(data);

      navigate("/explore");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to create the report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
              📝
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
                Create Report
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Report an Item
              </h1>

            </div>

          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
            Provide a few details about the item. Accurate information and
            a clear image make it easier for others to identify it.
          </p>

        </div>

      </section>

      {/* Form */}

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >

          {/* Status Selection */}

          <div className="border-b border-slate-200 p-6 sm:p-8">

            <div className="mb-5">

              <h2 className="text-lg font-bold text-slate-900">
                What happened?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select whether you lost the item or found it.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Lost */}

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    status: "lost",
                  }))
                }
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  formData.status === "lost"
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
                      formData.status === "lost"
                        ? "bg-red-100"
                        : "bg-slate-100"
                    }`}
                  >
                    🔴
                  </div>

                  <div>

                    <p className="font-bold text-slate-900">
                      I lost something
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Report an item that you cannot find.
                    </p>

                  </div>

                </div>

              </button>

              {/* Found */}

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    status: "found",
                  }))
                }
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  formData.status === "found"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
                      formData.status === "found"
                        ? "bg-emerald-100"
                        : "bg-slate-100"
                    }`}
                  >
                    🟢
                  </div>

                  <div>

                    <p className="font-bold text-slate-900">
                      I found something
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Help someone recover their lost item.
                    </p>

                  </div>

                </div>

              </button>

            </div>

          </div>

          {/* Item Information */}

          <div className="border-b border-slate-200 p-6 sm:p-8">

            <div className="mb-6">

              <h2 className="text-lg font-bold text-slate-900">
                Item Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add details that can help identify the item.
              </p>

            </div>

            <div className="space-y-6">

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
                  placeholder="e.g. Black iPhone 15 Pro"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

              {/* Category */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                >

                  <option value="">
                    Select a category
                  </option>

                  <option value="Electronics">
                    Electronics
                  </option>

                  <option value="Documents">
                    Documents
                  </option>

                  <option value="Accessories">
                    Accessories
                  </option>

                  <option value="Bags">
                    Bags
                  </option>

                  <option value="Clothing">
                    Clothing
                  </option>

                  <option value="Keys">
                    Keys
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

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
                  placeholder="Describe the item, including its color, brand, model, unique marks or other identifying details..."
                  required
                  rows="5"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                <p className="mt-2 text-xs text-slate-400">
                  More specific descriptions can make matching easier.
                </p>

              </div>

              {/* Location + Date */}

              <div className="grid gap-6 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Central Library"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />

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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* Image */}

          <div className="border-b border-slate-200 p-6 sm:p-8">

            <div className="mb-6">

              <h2 className="text-lg font-bold text-slate-900">
                Item Image
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload a clear photo of the item.
              </p>

            </div>

            {!preview ? (

              <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                  📷
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Click to upload an image
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PNG, JPG or JPEG
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

              </label>

            ) : (

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                <div className="flex h-[320px] items-center justify-center overflow-hidden bg-slate-100">

                  <img
                    src={preview}
                    alt="Item preview"
                    className="h-full w-full object-contain"
                  />

                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">

                  <p className="text-sm font-medium text-slate-600">
                    Image selected
                  </p>

                  <label className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-700">

                    Change image

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                  </label>

                </div>

              </div>

            )}

          </div>

          {/* Error */}

          {error && (

            <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-8">
              {error}
            </div>

          )}

          {/* Submit */}

          <div className="flex flex-col-reverse gap-3 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">

            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Publishing..." : "Publish Report →"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
};

export default CreateItem;