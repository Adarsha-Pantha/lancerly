"use client";

import { useEffect, useState } from "react";
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

export default function MyContractsPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    void loadData();
  }, [token, user]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const role = user?.role === "CLIENT" ? "CLIENT" : "FREELANCER";
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
  }

  const filteredContracts =
    statusFilter === "ALL"
      ? contracts
      : contracts.filter((c) => c.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-neutral flex items-center justify-center">
        <Loader2 className="animate-spin text-mint" size={40} />
      </div>
    );
  }

  const role = user?.role === "CLIENT" ? "CLIENT" : "FREELANCER";

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-blue mb-1">Contracts</h1>
          <p className="text-slate-600">Manage agreements between you and {role === "CLIENT" ? "freelancers" : "clients"}</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard
              icon={<Briefcase size={20} />}
              label="Total"
              value={stats.total}
            />
            <StatCard
              icon={<Folder size={20} />}
              label="Active"
              value={stats.active}
              accent="green"
            />
            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Completed"
              value={stats.completed}
              accent="blue"
            />
            <StatCard
              icon={<XCircle size={20} />}
              label="Terminated"
              value={stats.terminated}
              accent="red"
            />
            {stats.totalEarned !== undefined && (
              <StatCard
                icon={<TrendingUp size={20} />}
                label="Total Earned"
                value={`$${stats.totalEarned.toLocaleString()}`}
                accent="mint"
              />
            )}
            {stats.totalSpent !== undefined && (
              <StatCard
                icon={<DollarSign size={20} />}
                label="Total Spent"
                value={`$${stats.totalSpent.toLocaleString()}`}
                accent="mint"
              />
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["ALL", "ACTIVE", "COMPLETED", "TERMINATED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-mint text-white shadow-clay"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-clay p-12 text-center">
            <Folder className="text-slate-400 mx-auto mb-4" size={48} />
            <p className="text-slate-600 mb-2">
              {statusFilter === "ALL" ? "No contracts yet" : `No ${statusFilter.toLowerCase()} contracts`}
            </p>
            <p className="text-sm text-slate-500">
              {role === "CLIENT"
                ? "Accept a proposal to create a contract"
                : "Get hired on a project to see your contracts here"}
            </p>
          </div>
        ) : (
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

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: "green" | "blue" | "red" | "mint";
}) {
  const accentColors = {
    green: "text-green-600",
    blue: "text-blue-600",
    red: "text-red-600",
    mint: "text-mint",
  };
  return (
    <div className="bg-white rounded-xl shadow-clay p-4">
      <div className={`flex items-center gap-2 mb-2 ${accent ? accentColors[accent] : "text-slate-600"}`}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

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

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    TERMINATED: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-xl shadow-clay p-6 hover:shadow-clay-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {contract.project.title}
          </h2>
          {otherParty && (
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
              <User size={14} />
              <span>
                {currentUserRole === "CLIENT" ? "Freelancer" : "Client"}:{" "}
                <span className="font-medium">{otherParty}</span>
              </span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <DollarSign size={16} />
              <span className="font-semibold">
                ${contract.agreedBudget.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Started {new Date(contract.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>{contract._count.milestones} milestones</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{contract._count.timeEntries} time entries</span>
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusColors[contract.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {contract.status}
        </span>
      </div>

      <button
        onClick={() => router.push(`/contracts/${contract.id}`)}
        className="w-full bg-mint text-white py-2.5 rounded-xl font-medium hover:bg-mint-dark transition-all shadow-clay hover:shadow-clay-lg flex items-center justify-center gap-2"
      >
        View Contract
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
