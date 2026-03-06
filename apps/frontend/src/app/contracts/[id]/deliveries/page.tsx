"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, post, patch } from "@/lib/api";
import { Loader2, ArrowLeft, Plus, Upload, CheckCircle, XCircle, FileText, Calendar } from "lucide-react";

type Delivery = {
  id: string;
  title: string;
  description: string;
  attachments: string[];
  status: string;
  clientFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  milestone?: {
    id: string;
    title: string;
  };
};

type Contract = {
  id: string;
  project: {
    title: string;
  };
  milestones: Array<{
    id: string;
    title: string;
    status: string;
  }>;
};

export default function DeliveriesPage() {
  const router = useRouter();
  const params = useParams();
  const { token, user } = useAuth();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState("");

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "FREELANCER") {
      router.push(`/contracts/${contractId}`);
      return;
    }
    void loadData();
  }, [token, user, contractId]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [contractData, deliveriesData] = await Promise.all([
        get<Contract>(`/contracts/${contractId}`, token),
        get<Delivery[]>(`/contracts/${contractId}/deliveries`, token),
      ]);
      setContract(contractData);
      setDeliveries(deliveriesData);
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function submitDelivery(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !contract) return;

    setSubmitting(true);
    try {
      await post(
        `/contracts/${contract.id}/deliveries`,
        {
          title,
          description,
          milestoneId: selectedMilestone || undefined,
        },
        token
      );
      setShowForm(false);
      setTitle("");
      setDescription("");
      setSelectedMilestone("");
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to submit delivery");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Contract not found"}</p>
          <button
            onClick={() => router.push("/contracts/me")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    SUBMITTED: "bg-yellow-100 text-yellow-800",
    REVIEWING: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    REVISION_REQUESTED: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push(`/contracts/${contractId}`)}
          className="text-purple-600 hover:text-purple-700 mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Contract
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Deliveries</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus size={18} />
              Submit Delivery
            </button>
          </div>

          {showForm && (
            <form onSubmit={submitDelivery} className="mb-6 p-4 border border-slate-200 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {contract.milestones.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Milestone (Optional)</label>
                    <select
                      value={selectedMilestone}
                      onChange={(e) => setSelectedMilestone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">None</option>
                      {contract.milestones
                        .filter((m) => m.status !== "APPROVED" && m.status !== "PAID")
                        .map((milestone) => (
                          <option key={milestone.id} value={milestone.id}>
                            {milestone.title}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Delivery"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {deliveries.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="text-slate-400 mx-auto mb-4" size={48} />
              <p className="text-slate-600">No deliveries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900">{delivery.title}</h3>
                      {delivery.milestone && (
                        <p className="text-sm text-slate-500 mt-1">
                          For milestone: {delivery.milestone.title}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[delivery.status] || "bg-gray-100 text-gray-800"}`}>
                      {delivery.status}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-3">{delivery.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Submitted {new Date(delivery.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {delivery.reviewedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        <span>Reviewed {new Date(delivery.reviewedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {delivery.clientFeedback && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-700 mb-1">Client Feedback:</p>
                      <p className="text-sm text-slate-600">{delivery.clientFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

