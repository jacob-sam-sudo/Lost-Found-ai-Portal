
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyMatches,
  rejectMatch,
  returnMatch,
} from "../services/matchService";

import {
  submitOwnershipClaim,
  getMyClaims,
} from "../services/ownershipService";

import { createOrGetChat } from "../services/chatService";
import { AuthContext } from "../context/AuthContext";

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [claimFormId, setClaimFormId] = useState(null);

  const [answers, setAnswers] = useState({
    physicalFeature: "",
    identifyingDetail: "",
    additionalInformation: "",
  });

  // FETCH MATCHES AND CLAIMS
  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const [matchData, claimData] = await Promise.all([
        getMyMatches(),
        getMyClaims(),
      ]);

      setMatches(Array.isArray(matchData) ? matchData : []);

      setClaims(
        Array.isArray(claimData)
          ? claimData
          : claimData.claims || []
      );
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

  // SUBMIT OWNERSHIP CLAIM
  const handleSubmitClaim = async (matchId) => {
    if (
      !answers.physicalFeature.trim() ||
      !answers.identifyingDetail.trim() ||
      !answers.additionalInformation.trim()
    ) {
      alert("Please answer all three ownership questions.");
      return;
    }

    try {
      setActionLoading(matchId);

      await submitOwnershipClaim(matchId, answers);

      alert("Ownership claim submitted successfully.");

      setAnswers({
        physicalFeature: "",
        identifyingDetail: "",
        additionalInformation: "",
      });

      setClaimFormId(null);

      await fetchMatches();
    } catch (error) {
      console.error("Ownership claim error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to submit ownership claim."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // REJECT MATCH
  const handleReject = async (id) => {
    try {
      setActionLoading(id);

      await rejectMatch(id);

      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match._id === id
            ? { ...match, status: "rejected" }
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

  // MARK AS RETURNED
  const handleReturn = async (id) => {
    try {
      setActionLoading(id);

      await returnMatch(id);

      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match._id === id
            ? { ...match, status: "returned" }
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

  // OPEN CHAT
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

  // GET CLAIM FOR A MATCH
  const getClaimForMatch = (matchId) => {
    return claims.find(
      (claim) =>
        claim.match?._id === matchId ||
        claim.match === matchId
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Matches
            </h1>

            <p className="mt-2 text-gray-600">
              AI-generated potential matches for your lost and found items.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/ownership/received")}
            className="px-5 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
          >
            Review Received Claims
          </button>
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
              When the AI system finds a potential match for your items,
              it will appear here.
            </p>
          </div>
        )}

        {/* MATCH CARDS */}
        <div className="space-y-6">
          {matches.map((match) => {
            const lostItem = match.lostItem;
            const foundItem = match.foundItem;

            const isLostOwner =
              lostItem?.owner?._id?.toString() === user?._id?.toString() ||
              lostItem?.owner?.toString() === user?._id?.toString();

            const claim = getClaimForMatch(match._id);

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
                      {match.status.charAt(0).toUpperCase() +
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
                      {lostItem?.description || "No description provided."}
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
                      {foundItem?.description || "No description provided."}
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

                {/* POTENTIAL MATCH ACTIONS */}
                {match.status === "potential" && (
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => handleReject(match._id)}
                        disabled={actionLoading === match._id}
                        className="px-5 py-2 rounded-lg border border-red-300 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionLoading === match._id
                          ? "Processing..."
                          : "Reject Match"}
                      </button>

                      {isLostOwner && !claim && (
                        <button
                          type="button"
                          onClick={() => setClaimFormId(
                            claimFormId === match._id ? null : match._id
                          )}
                          className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
                        >
                          {claimFormId === match._id
                            ? "Close Verification Form"
                            : "Request Ownership Verification"}
                        </button>
                      )}
                    </div>

                    {/* CLAIM STATUS */}
                    {claim && (
                      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="font-semibold text-blue-800">
                          Ownership claim:{" "}
                          <span className="capitalize">{claim.status}</span>
                        </p>

                        <p className="mt-1 text-sm text-blue-700">
                          {claim.status === "pending"
                            ? "Your claim is waiting for the finder to review your answers."
                            : claim.status === "approved"
                            ? "Your ownership has been verified. You can now arrange the handover."
                            : claim.reviewNotes || "Your claim was rejected."}
                        </p>
                      </div>
                    )}

                    {/* OWNERSHIP FORM */}
                    {claimFormId === match._id && isLostOwner && !claim && (
                      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Verify Item Ownership
                        </h3>

                        <p className="text-sm text-gray-600 mt-1 mb-4">
                          Provide details that only the genuine owner is likely
                          to know. These answers will be shared privately with
                          the finder.
                        </p>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              1. Describe a physical feature of your item.
                            </label>

                            <textarea
                              value={answers.physicalFeature}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  physicalFeature: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-green-500 outline-none"
                              rows="2"
                              placeholder="Example: A small scratch near the bottom-right corner."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              2. Mention a unique identifying detail.
                            </label>

                            <textarea
                              value={answers.identifyingDetail}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  identifyingDetail: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-green-500 outline-none"
                              rows="2"
                              placeholder="Example: A blue sticker on the back."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              3. Provide any additional ownership information.
                            </label>

                            <textarea
                              value={answers.additionalInformation}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  additionalInformation: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-green-500 outline-none"
                              rows="2"
                              placeholder="Example: A set of keys was inside the front pocket."
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleSubmitClaim(match._id)}
                              disabled={actionLoading === match._id}
                              className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading === match._id
                                ? "Submitting..."
                                : "Submit Ownership Claim"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CONFIRMED MATCH */}
                {match.status === "confirmed" && (
                  <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="text-green-700">
                      <p className="font-semibold">
                        ✓ Ownership verified — match confirmed
                      </p>

                      <p className="text-sm mt-1">
                        The item can now be handed over.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenChat(match._id)}
                        disabled={actionLoading === match._id}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading === match._id
                          ? "Opening..."
                          : "Open Chat"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReturn(match._id)}
                        disabled={actionLoading === match._id}
                        className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {actionLoading === match._id
                          ? "Processing..."
                          : "Mark as Returned"}
                      </button>
                    </div>
                  </div>
                )}

                {/* REJECTED MATCH */}
                {match.status === "rejected" && (
                  <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
                    ✕ This match has been rejected.
                  </div>
                )}

                {/* RETURNED MATCH */}
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
