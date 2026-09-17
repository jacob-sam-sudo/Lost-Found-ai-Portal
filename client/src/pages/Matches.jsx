import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyMatches,
  confirmMatch,
  rejectMatch,
  returnMatch,
} from "../services/matchService";

import { createOrGetChat } from "../services/chatService";

const Matches = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH MATCHES
  // =====================================================
  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyMatches();

      setMatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch matches:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load matches."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // =====================================================
  // CONFIRM MATCH
  // =====================================================
  const handleConfirm = async (id) => {
    try {
      setActionLoading(id);

      await confirmMatch(id);

      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match._id === id
            ? {
                ...match,
                status: "confirmed",
              }
            : match
        )
      );
    } catch (error) {
      console.error("Confirm match error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to confirm match."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // REJECT MATCH
  // =====================================================
  const handleReject = async (id) => {
    try {
      setActionLoading(id);

      await rejectMatch(id);

      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match._id === id
            ? {
                ...match,
                status: "rejected",
              }
            : match
        )
      );
    } catch (error) {
      console.error("Reject match error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to reject match."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // MARK AS RETURNED
  // =====================================================
  const handleReturn = async (id) => {
    try {
      setActionLoading(id);

      await returnMatch(id);

      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match._id === id
            ? {
                ...match,
                status: "returned",
              }
            : match
        )
      );
    } catch (error) {
      console.error("Return match error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to mark match as returned."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // OPEN CHAT
  // =====================================================
  const handleOpenChat = async (matchId) => {
    try {
      setActionLoading(matchId);

      const chat = await createOrGetChat(matchId);

      navigate(`/chat/${chat._id}`);
    } catch (error) {
      console.error("Open chat error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to open chat."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          Loading matches...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Matches
          </h1>

          <p className="mt-2 text-gray-600">
            AI-generated potential matches for your
            lost and found items.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {matches.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No matches found
            </h2>

            <p className="mt-2 text-gray-500">
              When the AI system finds a potential
              match for your items, it will appear here.
            </p>
          </div>
        )}

        {/* MATCH CARDS */}
        <div className="space-y-6">

          {matches.map((match) => {
            const lostItem = match.lostItem;
            const foundItem = match.foundItem;

            return (
              <div
                key={match._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >

                {/* MATCH HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {match.status === "potential"
                        ? "Potential Match"
                        : match.status === "confirmed"
                        ? "Confirmed Match"
                        : match.status === "rejected"
                        ? "Rejected Match"
                        : "Returned Match"}
                    </h2>

                    <p className="text-sm text-gray-500">
                      AI similarity score
                    </p>
                  </div>

                  <div className="flex items-center gap-3">

                    <span className="text-lg font-bold text-blue-600">
                      {match.matchPercentage}%
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        match.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : match.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : match.status === "returned"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {match.status
                        .charAt(0)
                        .toUpperCase() +
                        match.status.slice(1)}
                    </span>

                  </div>
                </div>

                {/* ITEMS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* LOST ITEM */}
                  <div className="border border-gray-200 rounded-lg p-4">

                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                        LOST
                      </span>
                    </div>

                    {lostItem?.image && (
                      <img
                        src={lostItem.image}
                        alt={lostItem.title}
                        className="w-full h-48 object-contain bg-gray-50 rounded-lg mb-4"
                      />
                    )}

                    <h3 className="text-lg font-semibold text-gray-900">
                      {lostItem?.title || "Unknown item"}
                    </h3>

                    <p className="text-sm text-gray-600 mt-2">
                      {lostItem?.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-4 space-y-1 text-sm text-gray-500">

                      <p>
                        <strong>Category:</strong>{" "}
                        {lostItem?.category || "Not specified"}
                      </p>

                      <p>
                        <strong>Location:</strong>{" "}
                        {lostItem?.location || "Not specified"}
                      </p>

                    </div>
                  </div>

                  {/* FOUND ITEM */}
                  <div className="border border-gray-200 rounded-lg p-4">

                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                        FOUND
                      </span>
                    </div>

                    {foundItem?.image && (
                      <img
                        src={foundItem.image}
                        alt={foundItem.title}
                        className="w-full h-48 object-contain bg-gray-50 rounded-lg mb-4"
                      />
                    )}

                    <h3 className="text-lg font-semibold text-gray-900">
                      {foundItem?.title || "Unknown item"}
                    </h3>

                    <p className="text-sm text-gray-600 mt-2">
                      {foundItem?.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-4 space-y-1 text-sm text-gray-500">

                      <p>
                        <strong>Category:</strong>{" "}
                        {foundItem?.category || "Not specified"}
                      </p>

                      <p>
                        <strong>Location:</strong>{" "}
                        {foundItem?.location || "Not specified"}
                      </p>

                    </div>
                  </div>

                </div>

                {/* =====================================================
                    POTENTIAL MATCH ACTIONS
                ===================================================== */}
                {match.status === "potential" && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">

                    <button
                      type="button"
                      onClick={() =>
                        handleReject(match._id)
                      }
                      disabled={
                        actionLoading === match._id
                      }
                      className="px-5 py-2 rounded-lg border border-red-300 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50"
                    >
                      {actionLoading === match._id
                        ? "Processing..."
                        : "Reject Match"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleConfirm(match._id)
                      }
                      disabled={
                        actionLoading === match._id
                      }
                      className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === match._id
                        ? "Processing..."
                        : "Confirm Match"}
                    </button>

                  </div>
                )}

                {/* =====================================================
                    CONFIRMED MATCH
                ===================================================== */}
                {match.status === "confirmed" && (
                  <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-lg bg-green-50 border border-green-200 p-4">

                    <div className="text-green-700">

                      <p className="font-semibold">
                        ✓ Match confirmed
                      </p>

                      <p className="text-sm mt-1">
                        The item can now be handed over.
                      </p>

                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">

                      {/* OPEN CHAT */}
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenChat(match._id)
                        }
                        disabled={
                          actionLoading === match._id
                        }
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading === match._id
                          ? "Opening..."
                          : "Open Chat"}
                      </button>

                      {/* MARK RETURNED */}
                      <button
                        type="button"
                        onClick={() =>
                          handleReturn(match._id)
                        }
                        disabled={
                          actionLoading === match._id
                        }
                        className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {actionLoading === match._id
                          ? "Processing..."
                          : "Mark as Returned"}
                      </button>

                    </div>

                  </div>
                )}

                {/* =====================================================
                    REJECTED MATCH
                ===================================================== */}
                {match.status === "rejected" && (
                  <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
                    ✕ This match has been rejected.
                  </div>
                )}

                {/* =====================================================
                    RETURNED MATCH
                ===================================================== */}
                {match.status === "returned" && (
                  <div className="mt-6 rounded-lg bg-indigo-50 border border-indigo-200 p-4 text-indigo-700">
                    ✓ Item returned successfully. This match is complete.
                  </div>
                )}

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default Matches;