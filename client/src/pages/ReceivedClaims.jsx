
import React, { useEffect, useState } from "react";
import {
  getReceivedClaims,
  reviewOwnershipClaim,
} from "../services/ownershipService";

const ReceivedClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getReceivedClaims();
      setClaims(response.claims || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load ownership claims."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleReview = async (claimId, decision) => {
    const action = decision === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this ownership claim?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(claimId);
      setError("");

      await reviewOwnershipClaim(
        claimId,
        decision,
        reviewNotes[claimId] || ""
      );

      await fetchClaims();
    } catch (err) {
      setError(
        err.response?.data?.message || `Failed to ${action} ownership claim.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading ownership claims...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Received Ownership Claims
          </h1>
          <p className="mt-2 text-gray-600">
            Review the ownership details submitted by users claiming your
            found items.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {claims.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              No ownership claims yet
            </h2>
            <p className="mt-2 text-gray-500">
              Claims submitted for your found items will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => {
              const match = claim.match || {};
              const lostItem = match.lostItem || {};
              const foundItem = match.foundItem || {};
              const claimant = claim.claimant || {};
              const isPending = claim.status === "pending";

              return (
                <div
                  key={claim._id}
                  className="rounded-xl bg-white p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {lostItem.title || "Claimed item"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Found item: {foundItem.title || "Unknown item"}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Claimant: {claimant.name || "Unknown user"}
                        {claimant.email ? ` (${claimant.email})` : ""}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        claim.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : claim.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {claim.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h3 className="font-semibold text-gray-800">
                        1. Physical features
                      </h3>
                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                        {claim.answers?.physicalFeature}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <h3 className="font-semibold text-gray-800">
                        2. Identifying details
                      </h3>
                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                        {claim.answers?.identifyingDetail}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <h3 className="font-semibold text-gray-800">
                        3. Additional information
                      </h3>
                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                        {claim.answers?.additionalInformation}
                      </p>
                    </div>
                  </div>

                  {isPending ? (
                    <div className="mt-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review notes (optional)
                      </label>

                      <textarea
                        rows="3"
                        value={reviewNotes[claim._id] || ""}
                        onChange={(e) =>
                          setReviewNotes((previous) => ({
                            ...previous,
                            [claim._id]: e.target.value,
                          }))
                        }
                        placeholder="Explain your decision..."
                        className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={() =>
                            handleReview(claim._id, "approved")
                          }
                          disabled={processingId === claim._id}
                          className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingId === claim._id
                            ? "Processing..."
                            : "Approve Claim"}
                        </button>

                        <button
                          onClick={() =>
                            handleReview(claim._id, "rejected")
                          }
                          disabled={processingId === claim._id}
                          className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject Claim
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-medium text-gray-700">
                        Review notes
                      </p>
                      <p className="mt-1 text-gray-600">
                        {claim.reviewNotes || "No review notes provided."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivedClaims;
