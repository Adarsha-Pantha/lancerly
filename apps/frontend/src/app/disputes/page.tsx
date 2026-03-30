"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import Link from "next/link";
import DisputeEvidence from "@/components/disputes/DisputeEvidence";

type Dispute = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  adminNotes?: string;
  resolution?: string;
  createdAt: string;
  contract: { id: string; project: { title: string }; agreedBudget: number };
  evidence: Array<{
    id: string;
    fileUrl: string;
    fileName?: string;
    createdAt: string;
    uploadedBy: { email: string; profile: { name?: string } | null };
  }>;
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  OPEN:         { bg: "#fee2e2", color: "#b91c1c", label: "Open" },
  UNDER_REVIEW: { bg: "#fef3c7", color: "#b45309", label: "Under Review" },
  RESOLVED:     { bg: "#dcfce7", color: "#15803d", label: "Resolved" },
  CLOSED:       { bg: "#f3f4f6", color: "#6b7280", label: "Closed" },
};

const TYPE_LABELS: Record<string, string> = {
  PAYMENT: "Payment", SCOPE: "Scope", DELIVERY: "Delivery",
  QUALITY: "Quality", OTHER: "Other",
};

export default function MyDisputesPage() {
  const { token } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    get<Dispute[]>("/disputes/me", token)
      .then((d) => setDisputes(d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <>
      <style>{`
        .md-wrap { max-width: 800px; margin: 0 auto; padding: 32px 16px; }
        .md-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 10px; }
        .md-ph h1 { font-size: 20px; font-weight: 700; color: #111827; }
        .md-ph p { font-size: 13px; color: #9ca3af; margin-top: 3px; }
        .md-new { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #2563eb; color: white; border-radius: 7px; font-size: 13px; font-weight: 600; text-decoration: none; transition: background .13s; }
        .md-new:hover { background: #1d4ed8; }
        .md-card { background: white; border: 1px solid #e5e7eb; border-radius: 9px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); overflow: hidden; }
        .md-row { display: flex; align-items: center; justify-content: space-between; padding: 15px 18px; cursor: pointer; gap: 12px; }
        .md-row:hover { background: #fafafa; }
        .md-title { font-size: 14px; font-weight: 600; color: #111827; }
        .md-sub { font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .md-bdg { display: inline-flex; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
        .md-detail { border-top: 1px solid #f3f4f6; padding: 16px 18px; background: #fafafa; font-size: 13px; }
        .md-detail p { color: #4b5563; line-height: 1.6; }
        .md-note { margin-top: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 12px; font-size: 12.5px; color: #15803d; }
        .md-res { margin-top: 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px 12px; font-size: 12.5px; color: #1d4ed8; }
        .md-type { display: inline-flex; padding: 2px 8px; background: #f3f4f6; color: #6b7280; border-radius: 20px; font-size: 11px; font-weight: 600; margin-right: 6px; }
        .md-empty { text-align: center; padding: 60px 20px; color: #9ca3af; }
        .md-empty h3 { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        @keyframes md-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .md-fa { animation: md-in .22s ease both; }
      `}</style>

      <div className="md-fa md-wrap">
        <div className="md-top">
          <div className="md-ph">
            <h1>My Disputes</h1>
            <p>Track disputes you&apos;ve opened on your contracts.</p>
          </div>
          <Link href="/disputes/new" className="md-new">+ Open Dispute</Link>
        </div>

        {loading ? (
          <div className="md-empty">Loading…</div>
        ) : disputes.length === 0 ? (
          <div className="md-empty">
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚖️</div>
            <h3>No disputes yet</h3>
            <p>If you have an issue with a contract, you can open a dispute.</p>
            <Link href="/disputes/new" className="md-new" style={{ marginTop: 16, display: "inline-flex" }}>
              Open a Dispute
            </Link>
          </div>
        ) : (
          disputes.map((d) => {
            const s = STATUS_STYLES[d.status] ?? STATUS_STYLES.OPEN;
            const isOpen = expanded === d.id;
            return (
              <div key={d.id} className="md-card">
                <div className="md-row" onClick={() => setExpanded(isOpen ? null : d.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="md-title">{d.title}</div>
                    <div className="md-sub">
                      {d.contract.project.title} • ${d.contract.agreedBudget.toLocaleString()} •{" "}
                      {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span className="md-type">{TYPE_LABELS[d.type] || d.type}</span>
                    <span className="md-bdg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
                {isOpen && (
                  <div className="md-detail">
                    <p>{d.description}</p>
                    {d.adminNotes && (
                      <div className="md-note">
                        <strong>Admin Notes:</strong> {d.adminNotes}
                      </div>
                    )}
                    {d.resolution && (
                      <div className="md-res">
                        <strong>Resolution:</strong> {d.resolution}
                      </div>
                    )}
                    <DisputeEvidence 
                      disputeId={d.id} 
                      evidence={d.evidence || []} 
                      token={token || ""} 
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
