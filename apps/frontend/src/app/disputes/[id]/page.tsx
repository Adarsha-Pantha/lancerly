"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import Link from "next/link";
import DisputeEvidence from "@/components/disputes/DisputeEvidence";
import {
  ArrowLeft,
  Loader2,
  Scale,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";

type DisputeDetail = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  adminNotes?: string | null;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
  contract: {
    id: string;
    agreedBudget: number;
    project: { id: string; title: string };
    client: { id: string; profile: { name: string | null } | null };
    freelancer: { id: string; profile: { name: string | null } | null };
  };
  evidence: Array<{
    id: string;
    fileUrl: string;
    fileName?: string;
    createdAt: string;
    uploadedBy: { email: string; profile: { name?: string } | null };
  }>;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  OPEN:         { label: "Open",         color: "#b91c1c", bg: "#fee2e2", icon: AlertCircle },
  UNDER_REVIEW: { label: "Under Review", color: "#b45309", bg: "#fef3c7", icon: Clock },
  RESOLVED:     { label: "Resolved",     color: "#15803d", bg: "#dcfce7", icon: CheckCircle2 },
  CLOSED:       { label: "Closed",       color: "#6b7280", bg: "#f3f4f6", icon: XCircle },
};

const TYPE_LABELS: Record<string, string> = {
  PAYMENT: "Payment Dispute",
  SCOPE: "Scope Dispute",
  DELIVERY: "Delivery Dispute",
  QUALITY: "Quality Dispute",
  OTHER: "Other",
};

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    get<DisputeDetail>(`/disputes/${id}`, token)
      .then((d) => setDispute(d))
      .catch((err) => setError(err?.message || "Failed to load dispute"))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={28} />
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Scale size={48} className="text-slate-300" />
        <p className="text-slate-500 font-medium text-center">{error || "Dispute not found"}</p>
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-purple-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const status = STATUS_CONFIG[dispute.status] ?? STATUS_CONFIG.OPEN;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-5">

        {/* Back nav */}
        <Link
          href="/disputes"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft size={15} /> Back to disputes
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "#f3f4f6", color: "#6b7280" }}
                  >
                    {TYPE_LABELS[dispute.type] || dispute.type}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug">{dispute.title}</h1>
              </div>
              <span
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: status.bg, color: status.color }}
              >
                <StatusIcon size={12} />
                {status.label}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileText size={14} className="text-slate-400" />
              <span className="font-medium">{dispute.contract.project.title}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign size={14} className="text-slate-400" />
              <span>${dispute.contract.agreedBudget.toLocaleString()} contract</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar size={14} className="text-slate-400" />
              <span>Opened {new Date(dispute.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={14} className="text-slate-400" />
              <span>Updated {new Date(dispute.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {/* Parties */}
          <div className="px-6 py-4 flex items-center gap-6 border-b border-slate-100 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Client</p>
              <p className="font-semibold text-slate-800">{dispute.contract.client?.profile?.name || "—"}</p>
            </div>
            <div className="text-slate-300">vs</div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Freelancer</p>
              <p className="font-semibold text-slate-800">{dispute.contract.freelancer?.profile?.name || "—"}</p>
            </div>
            <div className="ml-auto">
              <Link
                href={`/contracts/${dispute.contract.id}`}
                className="text-xs font-semibold text-purple-600 hover:underline"
              >
                View contract →
              </Link>
            </div>
          </div>

          {/* Description */}
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{dispute.description}</p>
          </div>
        </div>

        {/* Admin notes */}
        {dispute.adminNotes && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-5">
            <h3 className="text-sm font-bold text-emerald-800 mb-2">Admin Notes</h3>
            <p className="text-emerald-700 text-sm leading-relaxed">{dispute.adminNotes}</p>
          </div>
        )}

        {/* Resolution */}
        {dispute.resolution && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-6 py-5">
            <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
              <CheckCircle2 size={15} /> Resolution
            </h3>
            <p className="text-blue-700 text-sm leading-relaxed">{dispute.resolution}</p>
          </div>
        )}

        {/* Evidence */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
          <DisputeEvidence
            disputeId={dispute.id}
            evidence={dispute.evidence || []}
            token={token || ""}
          />
        </div>
      </div>
    </div>
  );
}
