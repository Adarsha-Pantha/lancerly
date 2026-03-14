"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const disputes = [
  { id: "#D-0041", parties: "Tom O. vs Priya S.", type: "Payment", amount: "$1,200", status: "open", date: "Mar 6, 2025", detail: "Freelancer claims payment not received after delivery was marked complete." },
  { id: "#D-0039", parties: "Marcus B. vs Elena V.", type: "Scope", amount: "$450", status: "reviewing", date: "Mar 4, 2025", detail: "Client says deliverables don't match original scope outlined in proposal." },
  { id: "#D-0037", parties: "Jay Kim vs Acme Corp", type: "Delivery", amount: "$2,100", status: "resolved", date: "Feb 28, 2025", detail: "Both parties agreed on a partial refund of 30% for unfinished milestones." },
  { id: "#D-0035", parties: "Alice M. vs DevCo", type: "Quality", amount: "$800", status: "open", date: "Feb 25, 2025", detail: "Client reports code not meeting agreed technical specification." },
  { id: "#D-0033", parties: "Bob K. vs DesignHub", type: "Communication", amount: "$300", status: "resolved", date: "Feb 20, 2025", detail: "Resolved after mediation — freelancer provided additional revisions." },
];

export default function AdminDisputesPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") router.replace("/admin/login");
  }, [token, user]);

  if (!token || user?.role !== "ADMIN") return null;

  return (
    <>
      <style>{`
        .dsp-ph { margin-bottom: 20px; }
        .dsp-ph h1 { font-size: 18px; font-weight: 700; color: #111827; }
        .dsp-ph p { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .dsp-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .dsp-tbl { width: 100%; border-collapse: collapse; }
        .dsp-tbl th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .08em; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .dsp-tbl td { padding: 12px 16px; font-size: 13px; color: #4b5563; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
        .dsp-tbl tbody tr:last-child td { border-bottom: none; }
        .dsp-tbl tbody tr:hover td { background: #fafafa; }
        .dsp-bdg { display: inline-flex; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .dsp-bdg.open { background: #fee2e2; color: #b91c1c; }
        .dsp-bdg.reviewing { background: #fef3c7; color: #b45309; }
        .dsp-bdg.resolved { background: #dcfce7; color: #15803d; }
        .dsp-btn { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .13s; border: 1px solid #e5e7eb; background: transparent; color: #4b5563; }
        .dsp-btn:hover { background: #f9fafb; color: #111827; }
        .dsp-btn.resolve { background: #2563eb; color: white; border-color: #2563eb; }
        .dsp-btn.resolve:hover { background: #1d4ed8; }
        @keyframes dsp-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .dsp-fa { animation: dsp-in .22s ease both; }
      `}</style>

      <div className="dsp-fa">
        <div className="dsp-ph">
          <h1>Dispute Management</h1>
          <p>Review evidence and log decisions for all disputes.</p>
        </div>

        <div className="dsp-card">
          <div style={{ overflowX: "auto" }}>
            <table className="dsp-tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Parties</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>{d.id}</td>
                    <td style={{ fontWeight: 600, color: "#111827" }}>{d.parties}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 600, background: "#f3f4f6", color: "#4b5563", padding: "2px 8px", borderRadius: 20 }}>{d.type}</span>
                    </td>
                    <td style={{ maxWidth: 220, fontSize: 12, color: "#6b7280" }}>{d.detail}</td>
                    <td style={{ fontWeight: 700, color: "#b91c1c", whiteSpace: "nowrap" }}>{d.amount}</td>
                    <td style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{d.date}</td>
                    <td><span className={`dsp-bdg ${d.status}`}>{d.status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="dsp-btn">Review</button>
                        {d.status !== "resolved" && <button className="dsp-btn resolve">Resolve</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
