"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, post } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

type Contract = {
  id: string;
  project: { title: string };
  agreedBudget: number;
  status: string;
};

const DISPUTE_TYPES = [
  { value: "PAYMENT", label: "Payment Issue" },
  { value: "SCOPE", label: "Scope Dispute" },
  { value: "DELIVERY", label: "Delivery Problem" },
  { value: "QUALITY", label: "Quality Issue" },
  { value: "OTHER", label: "Other" },
];

export default function NewDisputePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    contractId: "",
    title: "",
    type: "OTHER",
    description: "",
  });

  useEffect(() => {
    if (!token) return;
    get<Contract[]>("/contracts/me", token)
      .then((d) => setContracts(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contractId || !form.title || !form.description) {
      toast("Please fill in all required fields", "error");
      return;
    }
    try {
      setSubmitting(true);
      await post("/disputes", form, token ?? undefined);
      toast("Dispute submitted successfully", "success");
      router.push("/disputes");
    } catch (err: any) {
      toast(err?.message || "Failed to submit dispute", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        .nd-wrap { max-width: 640px; margin: 0 auto; padding: 32px 16px; }
        .nd-ph { margin-bottom: 24px; }
        .nd-ph h1 { font-size: 20px; font-weight: 700; color: #111827; }
        .nd-ph p { font-size: 13px; color: #9ca3af; margin-top: 4px; }
        .nd-card { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 28px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
        .nd-field { margin-bottom: 18px; }
        .nd-label { display: block; font-size: 12.5px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .nd-input, .nd-select, .nd-textarea {
          width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 7px;
          font-size: 13.5px; color: #111827; font-family: inherit; outline: none;
          background: white; transition: border .15s;
        }
        .nd-input:focus, .nd-select:focus, .nd-textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
        .nd-textarea { resize: vertical; min-height: 120px; }
        .nd-btn { display: flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 7px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; background: #2563eb; color: white; transition: background .13s; }
        .nd-btn:hover { background: #1d4ed8; }
        .nd-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .nd-back { font-size: 13px; color: #6b7280; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; margin-bottom: 16px; }
        .nd-back:hover { color: #111827; }
        .nd-notice { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; font-size: 12.5px; color: #92400e; margin-bottom: 20px; }
        @keyframes nd-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .nd-fa { animation: nd-in .22s ease both; }
      `}</style>

      <div className="nd-fa nd-wrap">
        <a href="/disputes" className="nd-back">← Back to My Disputes</a>

        <div className="nd-ph">
          <h1>Open a Dispute</h1>
          <p>Submit a dispute against a contract. Our team will review it within 48 hours.</p>
        </div>

        <div className="nd-notice">
          ⚠️ Please try to resolve issues directly with the other party before filing a dispute.
          Disputes are reviewed by our admin team and may take time to resolve.
        </div>

        <div className="nd-card">
          <form onSubmit={handleSubmit}>
            <div className="nd-field">
              <label className="nd-label">Contract *</label>
              {loading ? (
                <div style={{ fontSize: 13, color: "#9ca3af" }}>Loading contracts…</div>
              ) : (
                <select
                  className="nd-select"
                  value={form.contractId}
                  onChange={(e) => setForm((f) => ({ ...f, contractId: e.target.value }))}
                  required
                >
                  <option value="">Select a contract…</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.project.title} — ${c.agreedBudget.toLocaleString()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="nd-field">
              <label className="nd-label">Dispute Type *</label>
              <select
                className="nd-select"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {DISPUTE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="nd-field">
              <label className="nd-label">Title *</label>
              <input
                className="nd-input"
                placeholder="Brief summary of the issue"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                maxLength={120}
              />
            </div>

            <div className="nd-field">
              <label className="nd-label">Description *</label>
              <textarea
                className="nd-textarea"
                placeholder="Describe the issue in detail. Include dates, amounts, and any evidence you have."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                minLength={10}
              />
            </div>

            <button className="nd-btn" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Dispute"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
