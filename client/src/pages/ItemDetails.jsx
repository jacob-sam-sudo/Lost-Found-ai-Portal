import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getItem, deleteItem } from "../services/itemService";

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getItem(id);
      setItem(data);
    } catch (err) {
      console.error("Error fetching item:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load this item."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteItem(id);

      navigate("/my-items");
    } catch (err) {
      console.error("Error deleting item:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this report."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="animate-pulse">

            <div className="mb-8 h-5 w-32 rounded bg-slate-200" />

            <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white md:grid-cols-2">

              <div className="h-[400px] bg-slate-200 md:h-[550px]" />

              <div className="space-y-6 p-6 sm:p-8">

                <div className="h-6 w-24 rounded-full bg-slate-200" />

                <div className="h-10 w-3/4 rounded bg-slate-200" />

                <div className="h-20 w-full rounded bg-slate-100" />

                <div className="space-y-3">

                  <div className="h-5 w-1/2 rounded bg-slate-200" />
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-5 w-1/2 rounded bg-slate-200" />

                </div>

                <div className="h-20 w-full rounded-2xl bg-slate-100" />

              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            {error ? "Something went wrong" : "Item not found"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "This report may have been deleted or is no longer available."}
          </p>

          <Link
            to="/explore"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            ← Back to Explore
          </Link>

        </div>

      </div>
    );
  }

  const ownerId =
    typeof item.owner === "object"
      ? item.owner?._id
      : item.owner;

  const currentUserId = user?._id || user?.id;

  const isOwner =
    currentUserId &&
    ownerId &&
    String(currentUserId) === String(ownerId);

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}

        <Link
          to="/explore"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
        >
          <span>←</span>
          Back to Explore
        </Link>

        {/* Main Card */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="grid md:grid-cols-2">

            {/* IMAGE */}

            <div
              style={{
                width: "100%",
                height: "400px",
                maxWidth: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f1f5f9",
              }}
              className="md:h-[550px]"
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

                <div className="flex flex-col items-center justify-center text-slate-400">

                  <span className="text-5xl">
                    📷
                  </span>

                  <p className="mt-3 text-sm font-medium">
                    No image available
                  </p>

                </div>

              )}

            </div>

            {/* DETAILS */}

            <div className="flex flex-col p-6 sm:p-8 lg:p-10">

              {/* Status */}

              <div className="flex items-center justify-between gap-4">

                <span
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    item.status === "lost"
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {item.status === "lost"
                    ? "Lost Item"
                    : "Found Item"}
                </span>

                <span className="text-sm font-medium text-slate-400">
                  {item.category || "Other"}
                </span>

              </div>

              {/* Title */}

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {item.title}
              </h1>

              {/* Description */}

              <div className="mt-6">

                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Description
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {item.description ||
                    "No description was provided for this item."}
                </p>

              </div>

              {/* Information */}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                <div className="rounded-2xl bg-slate-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      📍
                    </div>

                    <div className="min-w-0">

                      <p className="text-xs font-medium text-slate-400">
                        Location
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                        {item.location || "Not specified"}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl bg-slate-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      📅
                    </div>

                    <div>

                      <p className="text-xs font-medium text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {item.date
                          ? new Date(
                              item.date
                            ).toLocaleDateString()
                          : "Not specified"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* Owner */}

              <div className="mt-7 border-t border-slate-100 pt-7">

                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Reported By
                </p>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">

                  <div className="flex min-w-0 items-center gap-3">

                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        minWidth: "52px",
                        minHeight: "52px",
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
                          alt={
                            item.owner?.name ||
                            "User"
                          }
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

                        <span className="text-lg font-bold text-indigo-600">
                          {item.owner?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </span>

                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-slate-900">
                        {item.owner?.name ||
                          "Unknown User"}
                      </p>

                      {item.owner?.email && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.owner.email}
                        </p>
                      )}

                    </div>

                  </div>

                  {!isOwner && (
                    <button
                      type="button"
                      className="hidden rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 sm:block"
                    >
                      Contact
                    </button>
                  )}

                </div>

              </div>

              {/* Owner Actions */}

              {isOwner && (

                <div className="mt-7 flex gap-3 border-t border-slate-100 pt-7">

                  <Link
                    to={`/items/edit/${item._id}`}
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    Edit Report
                  </Link>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

        {/* Bottom Information */}

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              💡
            </div>

            <div>

              <h3 className="text-sm font-bold text-slate-900">
                Looking for this item?
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                If you believe this item belongs to you, make sure
                you can provide enough information to verify ownership
                before arranging a return.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default ItemDetails;