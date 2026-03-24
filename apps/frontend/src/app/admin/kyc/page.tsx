"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { get, post, toPublicUrl } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface KycRequest {
  userId: string;
  kycFrontImage: string;
  kycBackImage: string;
  kycStatus: string;
  user: { email: string; role: string };
  name: string;
  avatarUrl?: string; // profile already has this
}

const AV_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

const Icon = ({ d, size = 16 }: { d: string | string[]; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"],
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  close: "M18 6L6 18M6 6l12 12",
};

function DocsModal({ req, onClose }: { req: KycRequest; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,.18)",
          width: "100%", maxWidth: 760, overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
              {req.name || "Unnamed User"} — Identity Documents
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{req.user.email}</div>
          </div>
          <button
            onClick={onClose}
            style={{ border: "1px solid #e5e7eb", background: "transparent", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#6b7280" }}
          >
            <Icon d={icons.close} size={15} />
          </button>
        </div>

        {/* Images */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 20 }}>
          {[
            { label: "Citizenship Front", src: toPublicUrl(req.kycFrontImage) },
            { label: "Citizenship Back", src: toPublicUrl(req.kycBackImage) },
          ].map(({ label, src }) => (
            <div key={label}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", background: "#f9fafb", aspectRatio: "3/2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {src ? (
                  <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>No image</span>
                )}
              </div>
              {src && (
                <a href={src} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "#2563eb", marginTop: 6, display: "inline-block" }}>
                  Open full size ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminKycPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [viewing, setViewing] = useState<KycRequest | null>(null);

  useEffect(() => { fetchRequests(); }, [token]);

  async function fetchRequests() {
    if (!token) return;
    try {
      setLoading(true);
      const data = await get<KycRequest[]>("/admin/kyc/pending", token || undefined);
      setRequests(data || []);
    } catch { toast("Failed to load KYC requests", "error"); }
    finally { setLoading(false); }
  }

  async function handleApprove(userId: string) {
    if (!token) return;
    try {
      setProcessing(userId);
      await post(`/admin/kyc/${userId}/approve`, {}, token || undefined);
      toast("KYC Approved", "success");
      fetchRequests();
    } catch { toast("Failed to approve KYC", "error"); }
    finally { setProcessing(null); }
  }

  async function handleReject(userId: string) {
    const reason = window.prompt("Enter rejection reason:");
    if (reason === null) return;
    if (!token) return;
    try {
      setProcessing(userId);
      await post(`/admin/kyc/${userId}/reject`, { reason }, token || undefined);
      toast("KYC Rejected", "success");
      fetchRequests();
    } catch { toast("Failed to reject KYC", "error"); }
    finally { setProcessing(null); }
  }

  return (
    <>
      {viewing && <DocsModal req={viewing} onClose={() => setViewing(null)} />}

      <style>{`
        .kyc-ph { margin-bottom: 20px; }
        .kyc-ph h1 { font-size: 18px; font-weight: 700; color: #111827; }
        .kyc-ph p { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .kyc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .kyc-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .kyc-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .kyc-tbl { width: 100%; border-collapse: collapse; }
        .kyc-tbl th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .08em; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .kyc-tbl td { padding: 12px 16px; font-size: 13px; color: #4b5563; border-bottom: 1px solid #f3f4f6; }
        .kyc-tbl tbody tr:last-child td { border-bottom: none; }
        .kyc-tbl tbody tr:hover td { background: #fafafa; }
        .kyc-av { width: 30px; height: 30px; border-radius: 7px; color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .kyc-btn { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .13s; border: 1px solid #e5e7eb; background: transparent; color: #4b5563; font-family: inherit; }
        .kyc-btn:hover { background: #f3f4f6; color: #111827; }
        .kyc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .kyc-btn.approve { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
        .kyc-btn.approve:hover { background: #bbf7d0; }
        .kyc-btn.reject { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
        .kyc-btn.reject:hover { background: #fecaca; }
        .kyc-empty { padding: 60px 20px; text-align: center; color: #9ca3af; }
        .kyc-empty h3 { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        @keyframes kyc-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .kyc-fa { animation: kyc-in .22s ease both; }
      `}</style>

      <div className="kyc-fa">
        <div className="kyc-ph">
          <h1>KYC Verification</h1>
          <p>Review and verify user identity documents.</p>
        </div>

        <div className="kyc-top">
          <div />
          <span className="kyc-badge">⏳ {requests.length} Pending</span>
        </div>

        <div className="kyc-card">
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading requests…</div>
          ) : requests.length === 0 ? (
            <div className="kyc-empty">
              <div style={{ fontSize: 32, marginBottom: 10 }}>🛡️</div>
              <h3>No pending verifications</h3>
              <p>Identity submissions will appear here for review.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="kyc-tbl">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Documents</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, i) => (
                    <tr key={req.userId}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div className="kyc-av" style={{ background: AV_COLORS[i % AV_COLORS.length], overflow: "hidden" }}>
                            {req.avatarUrl ? (
                              <img src={toPublicUrl(req.avatarUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              (req.name?.[0] || req.user.email[0]).toUpperCase()
                            )}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                            {req.name || "Unnamed"}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "#6b7280", fontSize: 12.5 }}>{req.user.email}</td>
                      <td>
                        <span style={{
                          display: "inline-flex", padding: "2px 8px", borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                          background: req.user.role === "CLIENT" ? "#dbeafe" : "#ede9fe",
                          color: req.user.role === "CLIENT" ? "#1d4ed8" : "#6d28d9",
                        }}>
                          {req.user.role}
                        </span>
                      </td>
                      <td>
                        <button
                          className="kyc-btn"
                          onClick={() => setViewing(req)}
                        >
                          <Icon d={icons.eye} size={13} />
                          View Docs
                        </button>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="kyc-btn approve"
                            disabled={processing === req.userId}
                            onClick={() => handleApprove(req.userId)}
                          >
                            <Icon d={icons.check} size={12} />
                            Approve
                          </button>
                          <button
                            className="kyc-btn reject"
                            disabled={processing === req.userId}
                            onClick={() => handleReject(req.userId)}
                          >
                            <Icon d={icons.x} size={12} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
