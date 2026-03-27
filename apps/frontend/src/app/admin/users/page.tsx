"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { get, toPublicUrl } from "@/lib/api";

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
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"],
  check: "M20 6L9 17l-5-5",
  search: ["M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z", "M16 16l3.5 3.5"],
};

const AV_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") { router.replace("/admin/login"); return; }
    loadUsers();
  }, [token, user, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await get<{ users: User[]; total: number }>(`/admin/users?limit=${limit}&page=${page}`, token || undefined);
      setUsers(data.users);
      setTotal(data.total ?? data.users.length);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!token || user?.role !== "ADMIN") return null;

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const mq = !q || (u.profile?.name?.toLowerCase() || "").includes(q) || u.email.toLowerCase().includes(q);
    const mf = filter === "all" || u.role.toLowerCase() === filter;
    return mq && mf;
  });

  return (
    <>
      <style>{`
        .usr-ph { margin-bottom: 20px; }
        .usr-ph h1 { font-size: 18px; font-weight: 700; color: #111827; }
        .usr-ph p { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .usr-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
        .usr-tabs { display: flex; gap: 2px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 7px; padding: 3px; width: fit-content; }
        .usr-tab { padding: 5px 14px; border-radius: 5px; font-size: 12.5px; font-weight: 600; color: #4b5563; background: transparent; border: none; cursor: pointer; font-family: inherit; }
        .usr-tab.act { background: white; color: #2563eb; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .usr-tab:hover:not(.act) { color: #111827; }
        .usr-btns { display: flex; gap: 8px; align-items: center; }
        .usr-srch { display: flex; align-items: center; gap: 7px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 7px; padding: 6px 11px; width: 200px; }
        .usr-srch input { border: none; background: transparent; font-size: 13px; color: #111827; outline: none; font-family: inherit; width: 100%; }
        .usr-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .usr-tbl { width: 100%; border-collapse: collapse; }
        .usr-tbl th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .08em; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .usr-tbl td { padding: 12px 16px; font-size: 13px; color: #4b5563; border-bottom: 1px solid #f3f4f6; }
        .usr-tbl tbody tr:last-child td { border-bottom: none; }
        .usr-tbl tbody tr:hover td { background: #fafafa; }
        .usr-bdg { display: inline-flex; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .usr-bdg.client { background: #dbeafe; color: #1d4ed8; }
        .usr-bdg.freelancer { background: #ede9fe; color: #6d28d9; }
        .usr-bdg.admin { background: #dcfce7; color: #15803d; }
        .usr-bdg.pending { background: #fef9c3; color: #92400e; }
        .usr-av { width: 30px; height: 30px; border-radius: 7px; color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .usr-btn { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .13s; border: 1px solid #e5e7eb; background: transparent; color: #4b5563; text-decoration: none; }
        .usr-btn:hover { background: #f9fafb; color: #111827; }
        .usr-btn.primary { background: #2563eb; color: white; border-color: #2563eb; }
        .usr-btn.primary:hover { background: #1d4ed8; }
        .usr-pag { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-top: 1px solid #e5e7eb; }
        @keyframes usr-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .usr-fa { animation: usr-in .22s ease both; }
      `}</style>

      <div className="usr-fa">
        <div className="usr-ph">
          <h1>User Management</h1>
          <p>KYC verification, account control and moderation.</p>
        </div>

        <div className="usr-row">
          <div className="usr-tabs">
            {[["all", "All"], ["client", "Clients"], ["freelancer", "Freelancers"], ["admin", "Admins"]].map(([v, l]) => (
              <button key={v} className={`usr-tab${filter === v ? " act" : ""}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>
          <div className="usr-btns">
            <div className="usr-srch">
              <Icon d={icons.search[0]} size={13} stroke="#9ca3af" />
              <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="usr-btn"><Icon d={icons.check} size={12} />Bulk Approve</button>
          </div>
        </div>

        <div className="usr-card">
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading users...</div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="usr-tbl">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>KYC</th>
                      <th>Projects</th>
                      <th>Proposals</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, i) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div className="usr-av" style={{ background: AV_COLORS[i % AV_COLORS.length], overflow: "hidden" }}>
                              {u.profile?.avatarUrl ? (
                                <img src={toPublicUrl(u.profile.avatarUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                u.profile?.name?.[0] || u.email[0]
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{u.profile?.name || "Unknown"}</div>
                              <div style={{ fontSize: 11.5, color: "#9ca3af" }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`usr-bdg ${u.role.toLowerCase()}`}>{u.role}</span></td>
                        <td>
                          {(() => {
                            const s = u.profile?.kycStatus || "NOT_SUBMITTED";
                            const map: Record<string, { cls: string; label: string }> = {
                              APPROVED:      { cls: "client",     label: "✓ Verified" },
                              PENDING:       { cls: "pending",    label: "⏳ Pending" },
                              REJECTED:      { cls: "freelancer", label: "✗ Rejected" },
                              NOT_SUBMITTED: { cls: "pending",    label: "— Not submitted" },
                            };
                            const b = map[s] ?? { cls: "pending", label: s };
                            return <span className={`usr-bdg ${b.cls}`}>{b.label}</span>;
                          })()}
                        </td>
                        <td style={{ fontWeight: 600, color: "#111827" }}>{u.stats.projects}</td>
                        <td style={{ fontWeight: 600, color: "#111827" }}>{u.stats.proposals}</td>
                        <td style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/admin/users/${u.id}`} className="usr-btn">
                            <Icon d={icons.eye[0]} size={12} /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                          No users match.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="usr-pag">
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{filtered.length} users shown</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="usr-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                  <button className="usr-btn" onClick={() => setPage(p => p + 1)} disabled={users.length < limit}>Next →</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
