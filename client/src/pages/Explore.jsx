import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getItems } from "../services/itemService";

const Explore = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const data = await getItems();

      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page Header */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Community Reports
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Explore Lost & Found
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Browse recently reported items and see if someone has found
                what you're looking for.
              </p>

            </div>

            <Link
              to="/create-item"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
            >
              + Report an Item
            </Link>

          </div>

          {/* Search UI */}

          <div className="mt-8">

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:flex-row">

              <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3">

                <span className="text-lg text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search items by name, description or location..."
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

              </div>

              <button
                type="button"
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Search
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* Main Content */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Top Controls */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Recent Reports
            </h2>

            {!loading && (
              <p className="mt-1 text-sm text-slate-500">
                {items.length} {items.length === 1 ? "item" : "items"} reported
              </p>
            )}

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              All
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Lost
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Found
            </button>

          </div>

        </div>

        {/* Loading */}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map((item) => (

              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >

                <div className="h-[220px] animate-pulse bg-slate-200" />

                <div className="space-y-4 p-5">

                  <div className="flex justify-between">

                    <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />

                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />

                  </div>

                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />

                  <div className="flex items-center gap-3 pt-2">

                    <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />

                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

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
              🔎
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No reports yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There aren't any lost or found reports available right now.
              Be the first person to create one.
            </p>

            <Link
              to="/create-item"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Create a Report
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
                        transition: "transform 0.4s ease",
                      }}
                      className="group-hover:scale-[1.03]"
                    />

                  ) : (

                    <div className="flex flex-col items-center justify-center text-slate-400">

                      <span className="text-3xl">
                        📷
                      </span>

                      <span className="mt-2 text-xs font-medium">
                        No image available
                      </span>

                    </div>

                  )}

                </div>

                {/* Card Content */}

                <div className="p-5">

                  {/* Status + Category */}

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

                    <span className="max-w-[130px] truncate text-xs font-medium text-slate-400">
                      {item.category || "Other"}
                    </span>

                  </div>

                  {/* Title */}

                  <h3 className="mt-4 line-clamp-1 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  {/* Description */}

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {item.description || "No description provided."}
                  </p>

                  {/* Location + Date */}

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

                  {/* Owner */}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                    <div className="flex min-w-0 items-center gap-2.5">

                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          minWidth: "34px",
                          minHeight: "34px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#e0e7ff",
                        }}
                      >

                        {item.owner?.avatar ? (

                          <img
                            src={item.owner.avatar}
                            alt={item.owner?.name || "User"}
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

                          <span className="text-sm font-bold text-indigo-600">
                            {item.owner?.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </span>

                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="text-xs text-slate-400">
                          Posted by
                        </p>

                        <p className="truncate text-sm font-semibold text-slate-700">
                          {item.owner?.name || "Unknown User"}
                        </p>

                      </div>

                    </div>

                    {/* Details */}

                    <Link
                      to={`/items/${item._id}`}
                      className="ml-3 whitespace-nowrap text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
                    >
                      View →
                    </Link>

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

export default Explore;