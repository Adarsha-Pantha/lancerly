"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import {
  Loader2,
  Folder,
  DollarSign,
  Calendar,
  ArrowRight,
  Clock,
  FileText,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";

type Contract = {
  id: string;
  agreedBudget: number;
  status: string;
  startDate: string;
  project: {
    id: string;
    title: string;
  };
  client: {
    profile: {
      name: string;
      avatarUrl?: string;
    };
  };
  freelancer: {
    profile: {
      name: string;
      avatarUrl?: string;
    };
  };
  _count: {
    milestones: number;
    deliveries: number;
    timeEntries: number;
  };
};

type ContractStats = {
  total: number;
  active: number;
  completed: number;
  terminated: number;
  totalEarned?: number;
  totalSpent?: number;
};

const STATUS_FILTERS = ["ALL", "ACTIVE", "COMPLETED", "TERMINATED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const VIOLET       = "#7c3aed";
const VIOLET       = "#4f3fe0";
const VIOLET_LIGHT = "#eeecfc";

export default function MyContractsPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [contracts, setContracts]     = useState<Contract[]>([]);
  const [stats, setStats]             = useState<ContractStats | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  // Keep filter outside loadData so it never resets on fetch
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const role = user?.role === "CLIENT" ? "CLIENT" : "FREELANCER";

  const loadData = useCallback(async () => {
    if (!token) return;
    // Only show full-page loader on first load (contracts array is empty)
    setLoading((prev) => prev);
    setError(null);
    try {
      const [contractsData, statsData] = await Promise.all([
        get<Contract[]>(`/contracts/me?role=${role}`, token),
        get<ContractStats>(`/contracts/stats?role=${role}`, token),
      ]);
      setContracts(contractsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err?.message || "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    void loadData();
  }, [token, user, loadData]);

  // Normalise status to uppercase before comparing so API casing never breaks filter
  const filteredContracts =
    statusFilter === "ALL"
      ? contracts
      : contracts.filter(
          (c) => c.status?.toUpperCase() === statusFilter
        );

  // Count badges per tab — derived from the full contracts array, not filtered
  const tabCounts: Record<StatusFilter, number> = {
    ALL:        contracts.length,
    ACTIVE:     contracts.filter((c) => c.status?.toUpperCase() === "ACTIVE").length,
    COMPLETED:  contracts.filter((c) => c.status?.toUpperCase() === "COMPLETED").length,
    TERMINATED: contracts.filter((c) => c.status?.toUpperCase() === "TERMINATED").length,
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={36} style={{ color: VIOLET }} />
          <p className="text-sm text-gray-400 font-medium">Loading contracts…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <div className="space-y-8 py-2">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-black font-bold text-gray-900 mb-1">Contracts</h1>
        <p className="text-gray-400 text-sm">
          Manage agreements between you and{" "}
          {role === "CLIENT" ? "freelancers" : "clients"}
        </p>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard icon={<Briefcase size={18} />} label="Total"      value={stats.total}     />
          <StatCard icon={<Folder size={18} />}    label="Active"     value={stats.active}     accent="green" />
          <StatCard icon={<CheckCircle2 size={18} />} label="Completed" value={stats.completed} accent="blue"  />
          <StatCard icon={<XCircle size={18} />}   label="Terminated" value={stats.terminated} accent="red"   />
          {stats.totalEarned !== undefined && (
            <StatCard icon={<TrendingUp size={18} />} label="Total Earned" value={`$${stats.totalEarned.toLocaleString()}`} accent="violet" />
          )}
          {stats.totalSpent !== undefined && (
            <StatCard icon={<DollarSign size={18} />} label="Total Spent" value={`$${stats.totalSpent.toLocaleString()}`} accent="violet" />
          )}
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                isActive
                  ? { background: VIOLET, color: "#fff", boxShadow: `0 4px 14px -3px ${VIOLET}55` }
                  : { background: "#f3f4f6", color: "#6b7280" }
              }
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = VIOLET_LIGHT;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "#f3f4f6";
              }}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
              {/* Count badge */}
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={
                  isActive
                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { background: "#e5e7eb", color: "#6b7280" }
                }
              >
                {tabCounts[status]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {!error && filteredContracts.length === 0 && (
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: VIOLET_LIGHT }}
          >
            <Folder size={28} style={{ color: VIOLET }} />
          </div>
          <p className="font-bold text-gray-800 mb-1">
            {statusFilter === "ALL"
              ? "No contracts yet"
              : `No ${statusFilter.toLowerCase()} contracts`}
          </p>
          <p className="text-sm text-gray-400">
            {role === "CLIENT"
              ? "Accept a proposal to create a contract"
              : "Get hired on a project to see your contracts here"}
          </p>
        </div>
      )}

      {/* ── Contract list ── */}
      {!error && filteredContracts.length > 0 && (
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              currentUserRole={role}
            />
          ))}
        </div>
      )}

    </div>
  );
}

/* ─────────────────── StatCard ─────────────────── */
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: "green" | "blue" | "red" | "violet";
}) {
  const accentMap: Record<string, { bg: string; color: string }> = {
    green:  { bg: "#f0fdf4", color: "#16a34a" },
    blue:   { bg: "#eff6ff", color: "#2563eb" },
    red:    { bg: "#fef2f2", color: "#dc2626" },
    violet: { bg: "#eeecfc", color: "#4f3fe0" },
  };
  const a = accent ? accentMap[accent] : { bg: "#f9fafb", color: "#6b7280" };

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: a.bg, color: a.color }}
        >
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}

/* ─────────────────── ContractCard ─────────────────── */
function ContractCard({
  contract,
  currentUserRole,
}: {
  contract: Contract;
  currentUserRole: "CLIENT" | "FREELANCER";
}) {
  const router = useRouter();

  const otherParty =
    currentUserRole === "CLIENT"
      ? contract.freelancer?.profile?.name
      : contract.client?.profile?.name;

  const statusNorm = contract.status?.toUpperCase();

  const statusStyle: Record<string, { bg: string; color: string; dot: string }> = {
    ACTIVE:     { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
    COMPLETED:  { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
    TERMINATED: { bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" },
  };
  const sStyle = statusStyle[statusNorm] ?? { bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af" };

  return (
    <div
      className="bg-white border-2 border-gray-100 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-0.5"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#c9c3f5";
        e.currentTarget.style.boxShadow = "0 16px 40px -8px #4f3fe022";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">

        {/* Left */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 mb-2 truncate">
            {contract.project.title}
          </h2>

          {otherParty && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "#eeecfc", color: "#4f3fe0" }}
              >
                {otherParty.charAt(0)}
              </div>
              <span>
                {currentUserRole === "CLIENT" ? "Freelancer" : "Client"}:{" "}
                <span className="font-semibold text-gray-700">{otherParty}</span>
              </span>
            </div>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} />
              <span className="font-semibold text-gray-700">
                ${contract.agreedBudget.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Started {new Date(contract.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText size={14} />
              <span>{contract._count.milestones} milestones</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{contract._count.timeEntries} time entries</span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0"
          style={{ background: sStyle.bg, color: sStyle.color }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: sStyle.dot }}
          />
          {statusNorm.charAt(0) + statusNorm.slice(1).toLowerCase()}
        </div>
      </div>

      <div className="flex justify-end">


      <button
        onClick={() => router.push(`/contracts/${contract.id}`)}
        className=" py-3 px-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5 text-white"
        style={{ background: "#7c3aed", boxShadow: "0 6px 20px -4px #4f3fe055" }}
        style={{ background: "#4f3fe0", boxShadow: "0 6px 20px -4px #4f3fe055" }}
        >
        View Contract
        <ArrowRight size={16} />
      </button>
        </div>
    </div>
  );
}