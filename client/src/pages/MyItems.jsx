import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyItems, deleteItem } from "../services/itemService";

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyItems();
      setItems(data);
    } catch (err) {
      console.error("Error fetching my items:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your reports."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteItem(id);

      setItems((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error("Error deleting item:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete the report."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const lostCount = items.filter(
    (item) => item.status === "lost"
  ).length;

  const foundCount = items.filter(
    (item) => item.status === "found"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Your Activity
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                My Reports
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage the lost and found items you have reported.
              </p>

            </div>

            <Link
              to="/create-item"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
            >
              + Report an Item
            </Link>

          </div>

        </div>

      </section>

      {/* Main */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Statistics */}

        <div className="mb-10 grid gap-4 sm:grid-cols-3">

          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Reports
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {items.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                📋
              </div>

            </div>

          </div>

          {/* Lost */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Lost Items
                </p>

                <p className="mt-2 text-3xl font-bold text-red-500">
                  {lostCount}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                🔴
              </div>

            </div>

          </div>

          {/* Found */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Found Items
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-500">
                  {foundCount}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                🟢
              </div>

            </div>

          </div>

        </div>

        {/* Error */}

        {error && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>

        )}

        {/* Section Header */}

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Your Reports
            </h2>

            {!loading && (
              <p className="mt-1 text-sm text-slate-500">
                {items.length}{" "}
                {items.length === 1 ? "report" : "reports"}
              </p>
            )}

          </div>

        </div>

        {/* Loading Skeleton */}

        {loading && (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >

                <div className="h-[220px] animate-pulse bg-slate-200" />

                <div className="space-y-4 p-5">

                  <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />

                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />

                  <div className="flex gap-3 pt-2">

                    <div className="h-10 flex-1 animate-pulse rounded-xl bg-slate-200" />

                    <div className="h-10 w-20 animate-pulse rounded-xl bg-slate-200" />

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

        {/* Empty State */}

        {!loading && items.length === 0 && (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
              📋
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No reports yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't reported any lost or found items.
              Create your first report to get started.
            </p>

            <Link
              to="/create-item"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Create Your First Report
            </Link>

          </div>

        )}

        {/* Items */}

        {!loading && items.length > 0 && (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {items.map((item) => (

              <article
                key={item._id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
              >

                {/* Image */}

                <div
                  style={{
                    width: "100%",
                    height: "220px",
                    maxWidth: "100%",
                    overflow: "hidden",
                    backgroundColor: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  {item.image ? (

                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                    />

                  ) : (

                    <div className="text-center text-slate-400">

                      <div className="text-3xl">
                        📷
                      </div>

                      <p className="mt-2 text-xs font-medium">
                        No image
                      </p>

                    </div>

                  )}

                </div>

                {/* Content */}

                <div className="p-5">

                  <div className="flex items-center justify-between gap-3">

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        item.status === "lost"
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {item.status}
                    </span>

                    <span className="max-w-[120px] truncate text-xs font-medium text-slate-400">
                      {item.category || "Other"}
                    </span>

                  </div>

                  <h3 className="mt-4 line-clamp-1 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {item.description || "No description provided."}
                  </p>

                  {/* Details */}

                  <div className="mt-4 space-y-2">

                    <div className="flex items-center gap-2 text-sm text-slate-500">

                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs">
                        📍
                      </span>

                      <span className="truncate">
                        {item.location || "Location not specified"}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">

                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs">
                        📅
                      </span>

                      <span>
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "Date not specified"}
                      </span>

                    </div>

                  </div>

                  {/* Actions */}

                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">

                    <Link
                      to={`/items/${item._id}`}
                      className="flex-1 rounded-xl bg-indigo-50 px-4 py-2.5 text-center text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                    >
                      View
                    </Link>

                    <Link
                      to={`/items/edit/${item._id}`}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={deletingId === item._id}
                      onClick={() => handleDelete(item._id)}
                      className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === item._id ? "..." : "Delete"}
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </main>

    </div>
  );
};

export default MyItems;