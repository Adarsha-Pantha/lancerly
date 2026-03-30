"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import { Loader2, FileText, DollarSign, Calendar, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";

type Proposal = {
  id: string;
  coverLetter: string;
  proposedBudget?: number;
  status: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    description: string;
    budgetMin?: number;
    budgetMax?: number;
  };
};

export default function MyProposalsPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "FREELANCER") {
      router.replace("/projects/browse");
      return;
    }
    void loadProposals();
  }, [token, user]);

  async function loadProposals() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await get<Proposal[]>("/proposals/me", token);
      setProposals(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const statusIcons: Record<string, any> = {
    PENDING: Clock,
    ACCEPTED: CheckCircle,
    REJECTED: XCircle,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Proposals</h1>
          <p className="text-slate-600">Track the status of your submitted proposals</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="text-slate-400 mx-auto mb-4" size={48} />
            <p className="text-slate-600 mb-4">No proposals yet</p>
            <button
              onClick={() => router.push("/home")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Browse Projects
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const StatusIcon = statusIcons[proposal.status] || Clock;
              return (
                <div key={proposal.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900 mb-2">{proposal.project.title}</h2>
                      <p className="text-slate-600 line-clamp-2 mb-4">{proposal.project.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${statusColors[proposal.status] || "bg-gray-100 text-gray-800"}`}>
                        <StatusIcon size={14} />
                        {proposal.status}
                      </span>
                      {proposal.status === "ACCEPTED" && (
                        <button
                          onClick={() => router.push(`/contracts/project/${proposal.project.id}`)}
                          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          View Contract
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Your Proposal:</p>
                    <p className="text-slate-700 whitespace-pre-wrap line-clamp-3">{proposal.coverLetter}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    {proposal.proposedBudget && (
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span className="font-semibold">${proposal.proposedBudget.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Submitted {new Date(proposal.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

