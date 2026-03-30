"use client";

import React, { useState, useEffect } from "react";
import { get } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const BRAND = "#7739DB";

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  Paid: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  Processing: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
};

type StatusFilter = "All" | "Paid" | "Pending" | "Processing";

export default function Transaction() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [dateRange, setDateRange] = useState("This Month");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await get("/contracts/transactions");
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.project.toLowerCase().includes(search.toLowerCase()) ||
      tx.client.toLowerCase().includes(search.toLowerCase()) ||
      tx.ref.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || tx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalEarned = filtered.reduce((sum, tx) => sum + tx.net, 0);
  const totalFees = filtered.reduce((sum, tx) => sum + tx.fee, 0);
  const totalGross = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Title + Export */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1f1f1f" }}>
              Transaction History
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              View and manage all your earnings and payments
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#d1d5db", color: "#374151" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Gross Earnings", value: `NRP ${totalGross.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "#1f1f1f" },
            { label: "Service Fees", value: `-NRP ${Math.abs(totalFees).toFixed(2)}`, color: "#dc2626" },
            { label: "Net Earnings", value: `NRP ${totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: BRAND },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-5 border"
              style={{ backgroundColor: "#ffffff", borderColor: "#e5e5e3" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "#9ca3af" }}>
                {card.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters Row */}
        <div
          className="rounded-xl border p-4 mb-4"
          style={{ backgroundColor: "#ffffff", borderColor: "#e5e5e3" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="#9ca3af" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by project, client, or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none"
                style={{ borderColor: "#e5e5e3", backgroundColor: "#f9fafb", color: "#1f1f1f" }}
              />
            </div>

            {/* Status Filter */}
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "#e5e5e3" }}>
              {(["All", "Paid", "Pending", "Processing"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: statusFilter === s ? BRAND : "#ffffff",
                    color: statusFilter === s ? "#ffffff" : "#6b7280",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ borderColor: "#e5e5e3", color: "#374151", backgroundColor: "#ffffff" }}
            >
              {["This Week", "This Month", "Last 3 Months", "This Year"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm mb-3" style={{ color: "#9ca3af" }}>
          {loading ? "Loading transactions..." : `Showing ${filtered.length} of ${transactions.length} transactions`}
        </p>

        {/* Transaction Cards */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl border animate-pulse"
                style={{ backgroundColor: "#ffffff", borderColor: "#e5e5e3" }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{ backgroundColor: "#ffffff", borderColor: "#e5e5e3" }}
          >
            <p className="text-sm" style={{ color: "#9ca3af" }}>No transactions found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((tx) => {
              const s = statusStyles[tx.status];
              return (
                <div
                  key={tx.id}
                  className="rounded-xl border p-5 transition-shadow hover:shadow-md cursor-pointer"
                  style={{ backgroundColor: "#ffffff", borderColor: "#e5e5e3" }}
                >
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1f1f1f" }}>
                        {tx.project}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                        {tx.client}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {tx.status}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1px solid #f3f4f6", marginBottom: "16px" }} />

                  {/* Card Bottom Row */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Left: meta */}
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Date */}
                      <div className="flex items-center gap-1.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-xs" style={{ color: "#6b7280" }}>{tx.date}</span>
                      </div>

                      {/* Ref */}
                      <div className="flex items-center gap-1.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="text-xs font-mono" style={{ color: "#9ca3af" }}>{tx.ref}</span>
                      </div>
                    </div>

                    {/* Right: amounts */}
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-xs" style={{ color: "#9ca3af" }}>Gross</p>
                        <p className="text-sm font-medium" style={{ color: "#374151" }}>
                          NRP {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: "#9ca3af" }}>Fee</p>
                        <p className="text-sm" style={{ color: "#dc2626" }}>
                          -NRP {Math.abs(tx.fee).toFixed(2)}
                        </p>
                      </div>
                      <div
                        className="text-right pl-5"
                        style={{ borderLeft: "1px solid #e5e5e3" }}
                      >
                        <p className="text-xs" style={{ color: "#9ca3af" }}>Net Earned</p>
                        <p className="text-base font-bold" style={{ color: BRAND }}>
                          NRP {tx.net.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-end mt-4 gap-2">
          <button
            className="px-3 py-1 rounded border text-xs"
            style={{ borderColor: "#e5e5e3", color: "#6b7280" }}
          >
            Previous
          </button>
          <span
            className="px-3 py-1 rounded text-xs text-white"
            style={{ backgroundColor: BRAND }}
          >
            1
          </span>
          <button
            className="px-3 py-1 rounded border text-xs"
            style={{ borderColor: "#e5e5e3", color: "#6b7280" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}