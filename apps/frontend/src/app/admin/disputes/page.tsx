"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, patch } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
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
  raisedBy: { email: string; role: string; profile: { name?: string } | null };
  contract: {
    id: string;
    agreedBudget: number;
    project: { title: string };
    client: { email: string; profile: { name?: string } | null };
    freelancer: { email: string; profile: { name?: string } | null };
  };
  evidence: Array<{
    id: string;
    fileUrl: string;
    fileName?: string;
    createdAt: string;
    uploadedBy: { email: string; profile: { name?: string } | null };
  }>;
};

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  OPEN:         { bg: "#fee2e2", color: "#b91c1c", label: "Open" },
  UNDER_REVIEW: { bg: "#fef3c7", color: "#b45309", label: "Under Review" },
  RESOLVED:     { bg: "#dcfce7", color: "#15803d", label: "Resolved" },
  CLOSED:       { bg: "#f3f4f6", color: "#6b7280", label: "Closed" },
};

const TYPE_LABELS: Record<string, string> = {
  PAYMENT: "Payment", SCOPE: "Scope", DELIVERY: "Delivery",
  QUALITY: "Quality", OTHER: "Other",
};

const AV_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

function DetailModal({
  dispute,
  onClose,
  onUpdate,
}: {
  dispute: Dispute;
  onClose: () => void;
  onUpdate: (d: Dispute) => void;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState(dispute.status);
  const [adminNotes, setAdminNotes] = useState(dispute.adminNotes || "");
  const [resolution, setResolution] = useState(dispute.resolution || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      const updated = await patch<Dispute>(`/admin/disputes/${dispute.id}`, { status, adminNotes, resolution }, token ?? undefined);
      toast("Dispute updated", "success");
      onUpdate(updated);
      onClose();
    } catch (err: any) {
      toast(err?.message || "Failed to update dispute", "error");
    } finally {
      setSaving(false);
    }
  }

  const s = STATUS_CFG[dispute.status] ?? STATUS_CFG.OPEN;
  console.log(`[DEBUG] Admin DetailModal: dispute ID ${dispute.id}, evidence count: ${dispute.evidence?.length || 0}`);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,.18)", width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{dispute.title}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
              {dispute.contract.project.title} • ${dispute.contract.agreedBudget.toLocaleString()} • {new Date(dispute.createdAt).toLocaleDateString()}
            </div>
          </div>
          <span className="dsp-bdg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
        </div>

        <div style={{ padding: "18px 22px" }}>
          {/* Parties */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Client", u: dispute.contract.client },
              { label: "Freelancer", u: dispute.contract.freelancer },
            ].map(({ label, u }) => (
              <div key={label} style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px", border: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{u.profile?.name || "Unknown"}</div>
                <div style={{ fontSize: 11.5, color: "#9ca3af" }}>{u.email}</div>
              </div>
            ))}
          </div>

          {/* Raised by + type */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, background: "#f3f4f6", color: "#6b7280", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>
              Type: {TYPE_LABELS[dispute.type] || dispute.type}
            </span>
            <span style={{ fontSize: 12, background: "#f3f4f6", color: "#6b7280", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>
              Raised by: {dispute.raisedBy.profile?.name || dispute.raisedBy.email} ({dispute.raisedBy.role})
            </span>
          </div>

          {/* Description */}
          <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65, marginBottom: 20, background: "#f9fafb", padding: "12px 14px", borderRadius: 8, border: "1px solid #f0f0f0" }}>
            {dispute.description}
          </div>

          <DisputeEvidence 
            disputeId={dispute.id} 
            evidence={dispute.evidence || []} 
            token={token || ""} 
            isAdmin={true} 
          />

          {/* Admin actions */}
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Admin Action</div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none" }}
              >
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Admin Notes (visible to both parties)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes or update for both parties…"
                rows={3}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Resolution (optional)</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Final resolution once dispute is resolved…"
                rows={2}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: "8px 18px", background: "#2563eb", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={onClose}
                style={{ padding: "8px 14px", background: "transparent", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#6b7280" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDisputesPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Dispute | null>(null);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") { router.replace("/admin/login"); return; }
    loadDisputes();
  }, [token, user]);

  async function loadDisputes() {
    try {
      setLoading(true);
      const data = await get<Dispute[]>("/admin/disputes", token || undefined);
      console.log(`[DEBUG] Admin loaded ${data?.length || 0} disputes. Data check for first one evidence:`, data?.[0]?.evidence);
      setDisputes(data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  if (!token || user?.role !== "ADMIN") return null;

  const filtered = filter === "all" ? disputes : disputes.filter((d) => d.status === filter);

  return (
    <>
      {selected && (
        <DetailModal
          dispute={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            setSelected(null);
          }}
        />
      )}

      <style>{`
        .dsp-ph { margin-bottom: 20px; }
        .dsp-ph h1 { font-size: 18px; font-weight: 700; color: #111827; }
        .dsp-ph p { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .dsp-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
        .dsp-tabs { display: flex; gap: 2px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 7px; padding: 3px; }
        .dsp-tab { padding: 5px 14px; border-radius: 5px; font-size: 12.5px; font-weight: 600; color: #4b5563; background: transparent; border: none; cursor: pointer; font-family: inherit; }
        .dsp-tab.act { background: white; color: #2563eb; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .dsp-tab:hover:not(.act) { color: #111827; }
        .dsp-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .dsp-tbl { width: 100%; border-collapse: collapse; }
        .dsp-tbl th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .08em; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .dsp-tbl td { padding: 12px 16px; font-size: 13px; color: #4b5563; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
        .dsp-tbl tbody tr:last-child td { border-bottom: none; }
        .dsp-tbl tbody tr:hover td { background: #fafafa; }
        .dsp-bdg { display: inline-flex; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .dsp-btn { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .13s; border: 1px solid #e5e7eb; background: transparent; color: #4b5563; font-family: inherit; }
        .dsp-btn:hover { background: #f9fafb; color: #111827; }
        .dsp-av { width: 28px; height: 28px; border-radius: 6px; color: white; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        @keyframes dsp-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .dsp-fa { animation: dsp-in .22s ease both; }
      `}</style>

      <div className="dsp-fa">
        <div className="dsp-ph">
          <h1>Dispute Management</h1>
          <p>Review evidence and log decisions for all disputes.</p>
        </div>

        <div className="dsp-row">
          <div className="dsp-tabs">
            {[["all", "All"], ["OPEN", "Open"], ["UNDER_REVIEW", "Under Review"], ["RESOLVED", "Resolved"], ["CLOSED", "Closed"]].map(([v, l]) => (
              <button key={v} className={`dsp-tab${filter === v ? " act" : ""}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{filtered.length} disputes</span>
        </div>

        <div className="dsp-card">
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading disputes…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⚖️</div>
              <div style={{ fontWeight: 600, color: "#374151" }}>No disputes found</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dsp-tbl">
                <thead>
                  <tr>
                    <th>Raised By</th>
                    <th>Project</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => {
                    const s = STATUS_CFG[d.status] ?? STATUS_CFG.OPEN;
                    const name = d.raisedBy.profile?.name || d.raisedBy.email.split("@")[0];
                    return (
                      <tr key={d.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="dsp-av" style={{ background: AV_COLORS[i % AV_COLORS.length] }}>
                              {name[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{name}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>{d.raisedBy.role}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ maxWidth: 180, fontSize: 12.5, color: "#6b7280" }}>{d.contract.project.title}</td>
                        <td style={{ maxWidth: 200, fontWeight: 600, color: "#111827" }}>{d.title}</td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 600, background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 20 }}>
                            {TYPE_LABELS[d.type] || d.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: "#b91c1c", whiteSpace: "nowrap" }}>
                          ${d.contract.agreedBudget.toLocaleString()}
                        </td>
                        <td style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="dsp-bdg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                        <td>
                          <button className="dsp-btn" onClick={() => setSelected(d)}>Review</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
