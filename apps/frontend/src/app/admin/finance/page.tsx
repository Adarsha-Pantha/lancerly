"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import { Loader2, TrendingUp, ShieldCheck, Clock, AlertCircle } from "lucide-react";

interface FinanceStats {
  totalVolume: number;
  platformRevenue: number;
  inEscrow: number;
  recentTransactions: {
    id: string;
    projectTitle: string;
    amount: number;
    clientFee: number;
    freelancerFee: number;
    totalCharged: number;
    platformRevenue: number;
    date: string;
  }[];
}

export default function AdminFinancePage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }
    fetchStats();
  }, [token, user]);

  const fetchStats = async () => {
    try {
      const data = await get<FinanceStats>("/admin/finance/stats", token!);
      setStats(data);
    } catch (e) {
      console.error("Failed to fetch finance stats", e);
    } finally {
      setLoading(false);
    }
  };

  if (!token || user?.role !== "ADMIN") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const summaryCards = [
    { label: "Total Volume", value: `$${((stats?.totalVolume || 0) / 100).toLocaleString()}`, sub: "Gross transaction volume", color: "#6366f1", icon: <TrendingUp size={24} /> },
    { label: "Platform Revenue", value: `$${((stats?.platformRevenue || 0) / 100).toLocaleString()}`, sub: "Fees collected", color: "#059669", icon: <ShieldCheck size={24} /> },
    { label: "In Escrow", value: `$${((stats?.inEscrow || 0) / 100).toLocaleString()}`, sub: "Funded milestones", color: "#f59e0b", icon: <Clock size={24} /> },
    { label: "Avg. Fee", value: stats?.totalVolume ? `${((stats.platformRevenue / stats.totalVolume) * 100).toFixed(1)}%` : "0%", sub: "Net take rate", color: "#2563eb", icon: <TrendingUp size={24} /> },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .fin-ph h1 { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .fin-ph p { font-size: 13px; color: #9ca3af; }
        .fin-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0 24px; }
        @media (max-width: 1000px) { .fin-grid { grid-template-columns: repeat(2, 1fr); } }
        .fin-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .fin-card .ico { margin-bottom: 12px; display: inline-flex; padding: 8px; border-radius: 8px; background: #f9fafb; color: #6b7280; }
        .fin-card .val { font-size: 24px; font-weight: 800; letter-spacing: -.04em; line-height: 1; margin-bottom: 4px; }
        .fin-card .lbl { font-size: 12px; font-weight: 600; color: #4b5563; }
        .fin-card .sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }
        
        .fin-table-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); overflow: hidden; }
        .fin-table-head { padding: 16px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
        .fin-table-head h2 { font-size: 14px; font-weight: 700; color: #111827; }
        
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 12px 16px; color: #6b7280; font-weight: 600; background: #f9fafb; border-bottom: 1px solid #f3f4f6; }
        td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; }
        tr:last-child td { border-bottom: none; }
        
        .c-fee { color: #059669; font-weight: 500; }
        .f-fee { color: #ea580c; font-weight: 500; }
        .t-amt { font-weight: 700; color: #111827; }

        @keyframes fin-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .fin-fa { animation: fin-in .22s ease both; }
      `}} />

      <div className="fin-fa">
        <div className="fin-ph">
          <h1>Finance</h1>
          <p>Platform revenue, payouts, escrow, and transaction management.</p>
        </div>

        <div className="fin-grid">
          {summaryCards.map(c => (
            <div className="fin-card" key={c.label}>
              <div className="ico" style={{ color: c.color }}>{c.icon}</div>
              <div className="val" style={{ color: c.color }}>{c.value}</div>
              <div className="lbl">{c.label}</div>
              <div className="sub">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="fin-table-box">
          <div className="fin-table-head">
            <h2>Recent Transactions</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Client Fee</th>
                  <th>Freelancer Fee</th>
                  <th>Total Charged</th>
                  <th>Platform Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No transactions recorded yet.</td>
                  </tr>
                ) : (
                  stats?.recentTransactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500 }}>{t.projectTitle}</td>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>${(t.amount / 100).toFixed(2)}</td>
                      <td className="c-fee">+${((t.clientFee || 0) / 100).toFixed(2)}</td>
                      <td className="f-fee">-${((t.freelancerFee || 0) / 100).toFixed(2)}</td>
                      <td className="t-amt">${(t.totalCharged / 100).toFixed(2)}</td>
                      <td style={{ color: '#059669', fontWeight: 600 }}>${(t.platformRevenue / 100).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
