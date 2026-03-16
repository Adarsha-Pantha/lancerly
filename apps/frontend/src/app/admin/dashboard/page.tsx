"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";

type Stats = {
  totalUsers: number;
  clients: number;
  freelancers: number;
  totalProjects: number;
  totalPosts: number;
  totalConversations: number;
  totalProposals: number;
};

type User = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: any;
  stats: { projects: number; proposals: number; posts: number; conversations: number };
};

const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p: string, i: number) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  projects: ["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"],
  proposals: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8"],
  disputes: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"],
  trending: ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
};

const activityFeed = [
  { text: "New user Sarah Chen registered", time: "2m ago", type: "user" },
  { text: "Project #3891 received 3 new proposals", time: "9m ago", type: "project" },
  { text: "Dispute #D-0041 opened by Tom Okafor", time: "22m ago", type: "dispute" },
  { text: "Withdrawal of $840 processed for Marcus Bell", time: "1h ago", type: "finance" },
  { text: "AI Proposal Assistant generated 12 drafts", time: "2h ago", type: "ai" },
  { text: "Project #3888 complete — escrow released", time: "3h ago", type: "finance" },
];

const categories = [
  { name: "Web Development", projects: 1204, growth: "+14%", color: "#2563eb" },
  { name: "UI/UX Design", projects: 874, growth: "+9%", color: "#7c3aed" },
  { name: "Mobile Dev", projects: 612, growth: "+21%", color: "#059669" },
  { name: "AI / ML", projects: 388, growth: "+38%", color: "#d97706" },
  { name: "Content Writing", projects: 341, growth: "+6%", color: "#db2777" },
  { name: "Marketing", projects: 298, growth: "+4%", color: "#0891b2" },
];

const staticDisputes = [
  { id: "#D-0041", parties: "Tom O. vs Priya S.", amount: "$1,200", status: "open" },
  { id: "#D-0039", parties: "Marcus B. vs Elena V.", amount: "$450", status: "reviewing" },
  { id: "#D-0037", parties: "Jay Kim vs Acme Corp", amount: "$2,100", status: "resolved" },
];

function MiniBar({ color }: { color: string }) {
  const bars = [35, 55, 42, 70, 58, 80, 65, 88, 50, 92, 72, 100];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: 4, height: `${h}%`, borderRadius: 2, background: i === bars.length - 1 ? color : `${color}30` }} />
      ))}
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}

const AV_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") { router.replace("/admin/login"); return; }
    loadData();
  }, [token, user]);

  const loadData = async () => {
    try {
      const [s, u] = await Promise.all([
        get<Stats>("/admin/dashboard/stats", token),
        get<{ users: User[] }>("/admin/users?limit=5", token),
      ]);
      setStats(s);
      setDbUsers(u.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!token || user?.role !== "ADMIN") return null;
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), change: "+8.2%", positive: true, icon: "users", color: "#2563eb" },
    { label: "Active Projects", value: stats.totalProjects.toLocaleString(), change: "+12%", positive: true, icon: "projects", color: "#059669" },
    { label: "Proposals Sent", value: stats.totalProposals.toLocaleString(), change: "+5.8%", positive: true, icon: "proposals", color: "#d97706" },
    { label: "Conversations", value: stats.totalConversations.toLocaleString(), change: "+3%", positive: true, icon: "disputes", color: "#7c3aed" },
  ] : [];

  return (
    <>
      <style>{`
        .adm-ph { margin-bottom: 20px; }
        .adm-ph h1 { font-size: 18px; font-weight: 700; color: #111827; }
        .adm-ph p { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .adm-sg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
        @media (max-width: 1100px) { .adm-sg { grid-template-columns: repeat(2,1fr); } }
        .adm-sc { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 18px; box-shadow: 0 1px 3px rgba(0,0,0,.07); transition: box-shadow .15s, transform .15s; }
        .adm-sc:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); transform: translateY(-1px); }
        .adm-g31 { display: grid; grid-template-columns: 1fr 320px; gap: 14px; margin-bottom: 18px; }
        .adm-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
        @media (max-width: 1050px) { .adm-g31, .adm-g2 { grid-template-columns: 1fr; } }
        .adm-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .adm-ch { padding: 14px 18px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; }
        .adm-ct { font-size: 13.5px; font-weight: 700; color: #111827; }
        .adm-cs { font-size: 12px; color: #9ca3af; margin-top: 1px; }
        .adm-tbl { width: 100%; border-collapse: collapse; }
        .adm-tbl th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .08em; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .adm-tbl td { padding: 12px 16px; font-size: 13px; color: #4b5563; border-bottom: 1px solid #f3f4f6; }
        .adm-tbl tbody tr:last-child td { border-bottom: none; }
        .adm-tbl tbody tr:hover td { background: #fafafa; }
        .adm-bdg { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .adm-bdg.client { background: #dbeafe; color: #1d4ed8; }
        .adm-bdg.freelancer { background: #ede9fe; color: #6d28d9; }
        .adm-bdg.active { background: #dbeafe; color: #1d4ed8; }
        .adm-bdg.open { background: #fee2e2; color: #b91c1c; }
        .adm-bdg.reviewing { background: #fef3c7; color: #b45309; }
        .adm-bdg.resolved { background: #dcfce7; color: #15803d; }
        .adm-fi { display: flex; align-items: flex-start; gap: 11px; padding: 11px 18px; border-bottom: 1px solid #f3f4f6; }
        .adm-fi:last-child { border-bottom: none; }
        .adm-fi:hover { background: #fafafa; }
        .adm-cr { padding: 12px 18px; border-bottom: 1px solid #f3f4f6; }
        .adm-cr:last-child { border-bottom: none; }
        .adm-av { width: 30px; height: 30px; border-radius: 7px; color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .adm-btn { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .13s; border: 1px solid #e5e7eb; background: transparent; color: #4b5563; }
        .adm-btn:hover { background: #f9fafb; color: #111827; }
        @keyframes adm-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .adm-fa { animation: adm-in .22s ease both; }
      `}</style>

      <div className="adm-fa">
        <div className="adm-ph">
          <h1>Overview</h1>
          <p>Platform performance — Realtime</p>
        </div>

        {/* Stats */}
        <div className="adm-sg">
          {statCards.map((s, i) => (
            <div className="adm-sc" key={s.label} style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={icons[s.icon as keyof typeof icons]} size={17} stroke={s.color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: s.positive ? "#dcfce7" : "#fee2e2", color: s.positive ? "#16a34a" : "#dc2626" }}>{s.change}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", letterSpacing: "-.04em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12.5, color: "#4b5563", marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              <div style={{ marginTop: 10 }}><MiniBar color={s.color} /></div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="adm-g31">
          <div className="adm-card">
            <div className="adm-ch">
              <div><div className="adm-ct">Recent Users</div><div className="adm-cs">Latest registrations</div></div>
              <Link href="/admin/users" className="adm-btn" style={{ textDecoration: "none" }}>View all</Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="adm-tbl">
                <thead><tr><th>User</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {dbUsers.map((u, i) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div className="adm-av" style={{ background: AV_COLORS[i % AV_COLORS.length] }}>{u.profile?.name?.[0] || u.email[0]}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{u.profile?.name || "Unknown"}</div>
                            <div style={{ fontSize: 11.5, color: "#9ca3af" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`adm-bdg ${u.role.toLowerCase()}`}>{u.role}</span></td>
                      <td style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-ch">
              <div className="adm-ct">Live Activity</div>
              <span className="adm-bdg active">Live</span>
            </div>
            {activityFeed.map((a, i) => {
              const dc: Record<string, string> = { user: "#2563eb", project: "#059669", dispute: "#dc2626", finance: "#d97706", ai: "#7c3aed" };
              return (
                <div className="adm-fi" key={i}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: dc[a.type], marginTop: 4, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: "#4b5563", flex: 1, lineHeight: 1.5 }}>{a.text}</span>
                  <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{a.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="adm-g2">
          <div className="adm-card">
            <div className="adm-ch"><div className="adm-ct">Category Health</div><div className="adm-cs">By active project volume</div></div>
            {categories.map(c => (
              <div className="adm-cr" key={c.name}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.name}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>{c.growth}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{c.projects.toLocaleString()}</span>
                  </div>
                </div>
                <ProgressBar value={c.projects} max={1204} color={c.color} />
              </div>
            ))}
          </div>

          <div className="adm-card">
            <div className="adm-ch">
              <div className="adm-ct">Disputes</div>
              <div className="adm-cs">Requires admin review</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="adm-tbl">
                <thead><tr><th>ID</th><th>Parties</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {staticDisputes.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>{d.id}</td>
                      <td style={{ fontSize: 12 }}>{d.parties}</td>
                      <td style={{ fontWeight: 700 }}>{d.amount}</td>
                      <td><span className={`adm-bdg ${d.status}`}>{d.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
