"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, toPublicUrl } from "@/lib/api";

type Project = {
  id: string;
  title: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  skills: string[];
  projectType: string;
  status: string;
  createdAt: string;
  client?: { email?: string; profile?: { name?: string; avatarUrl?: string } };
  _count?: { proposals: number };
};

const AV_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

export default function AdminProjectsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") { 
      // AdminLayout already handles redirection to /login
      return; 
    }
    load();
  }, [token, user]);

  const load = async () => {
    try {
      const data = await get<Project[]>("/projects", token || undefined);
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!token || user?.role !== "ADMIN") return null;

  const filtered = projects.filter(p => filter === "all" || p.status === filter.toUpperCase() || p.status.toLowerCase() === filter);
  const statusColor: Record<string, string> = {
    OPEN: "adm-p-bdg open", IN_PROGRESS: "adm-p-bdg inprogress",
    COMPLETED: "adm-p-bdg completed", CANCELLED: "adm-p-bdg cancelled",
  };

  return (
    <>
      <style>{`
        .adm-p-ph { margin-bottom: 20px; }
        .adm-p-ph h1 { font-size: 18px; font-weight: 700; color: #111827; }
        .adm-p-ph p { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .adm-p-tabs { display: flex; gap: 2px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 7px; padding: 3px; margin-bottom: 14px; width: fit-content; }
        .adm-p-tab { padding: 5px 14px; border-radius: 5px; font-size: 12.5px; font-weight: 600; color: #4b5563; background: transparent; border: none; cursor: pointer; font-family: inherit; }
        .adm-p-tab.act { background: white; color: #2563eb; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .adm-p-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .adm-p-tbl { width: 100%; border-collapse: collapse; }
        .adm-p-tbl th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .08em; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .adm-p-tbl td { padding: 12px 16px; font-size: 13px; color: #4b5563; border-bottom: 1px solid #f3f4f6; }
        .adm-p-tbl tbody tr:last-child td { border-bottom: none; }
        .adm-p-tbl tbody tr:hover td { background: #fafafa; }
        .adm-p-bdg { display: inline-flex; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .adm-p-bdg.open { background: #dbeafe; color: #1d4ed8; }
        .adm-p-bdg.inprogress { background: #fef3c7; color: #b45309; }
        .adm-p-bdg.completed { background: #dcfce7; color: #15803d; }
        .adm-p-bdg.cancelled { background: #fee2e2; color: #b91c1c; }
        .adm-p-av { width: 28px; height: 28px; border-radius: 6px; color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        @keyframes adm-p-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .adm-p-fa { animation: adm-p-in .22s ease both; }
      `}</style>

      <div className="adm-p-fa">
        <div className="adm-p-ph">
          <h1>Projects</h1>
          <p>All posted projects across the platform.</p>
        </div>

        <div className="adm-p-tabs">
          {[["all", "All"], ["open", "Open"], ["in_progress", "In Progress"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([v, l]) => (
            <button key={v} className={`adm-p-tab${filter === v ? " act" : ""}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        <div className="adm-p-card">
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading projects...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="adm-p-tbl">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Budget</th>
                    <th>Type</th>
                    <th>Proposals</th>
                    <th>Status</th>
                    <th>Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#111827", fontSize: 13.5 }}>{p.title}</div>
                        <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 2 }}>{p.skills?.slice(0, 3).join(", ")}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="adm-p-av" style={{ background: AV_COLORS[i % AV_COLORS.length] }}>
                            {p.client?.profile?.avatarUrl ? (
                              <img src={toPublicUrl(p.client.profile.avatarUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              (p.client?.profile?.name?.[0] || p.client?.email?.[0] || "?").toUpperCase()
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: "#4b5563" }}>
                            {p.client?.profile?.name || p.client?.email?.split('@')[0] || "—"}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: "#15803d" }}>
                        {p.budgetMin || p.budgetMax
                          ? `$${p.budgetMin ?? 0}${p.budgetMax ? ` – $${p.budgetMax}` : ""}`
                          : "—"}
                      </td>
                      <td>
                        <span style={{ fontSize: 11, background: "#f3f4f6", color: "#4b5563", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                          {p.projectType === "FREELANCER_SHOWCASE" ? "Showcase" : "Request"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "#111827" }}>{p._count?.proposals ?? 0}</td>
                      <td>
                        <span className={`adm-p-bdg ${
                          p.status === "OPEN" ? "open" :
                          p.status === "IN_PROGRESS" ? "inprogress" :
                          p.status === "COMPLETED" ? "completed" : "cancelled"
                        }`}>{p.status.replace("_", " ")}</span>
                      </td>
                      <td style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>No projects found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
