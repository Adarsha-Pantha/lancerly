"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { get, toPublicUrl } from "@/lib/api";

type SubscribedUser = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  isSubscribed: boolean;
  profile?: {
    name: string;
    avatarUrl?: string;
  };
};

const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p: string, i: number) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"],
  zap: ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  search: ["M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z", "M16 16l3.5 3.5"],
  mail: ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  calendar: ["M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z", "M16 2v4", "M8 2v4", "M3 10h18"],
};

const AV_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<SubscribedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") { 
      // AdminLayout already handles redirection to /login
      return; 
    }
    loadSubscribers();
  }, [token, user]);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const data = await get<SubscribedUser[]>("/admin/subscribed-users", token || undefined);
      setUsers(data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.profile?.name?.toLowerCase() || "").includes(q) || u.email.toLowerCase().includes(q);
  });

  if (!token || user?.role !== "ADMIN") return null;

  return (
    <>
      <style>{`
        .sub-ph { margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
        .sub-ph h1 { font-size: 20px; font-weight: 700; color: #111827; }
        .sub-ph p { font-size: 13.5px; color: #6b7280; margin-top: 2px; }
        .sub-badge-count { display: flex; align-items: center; gap: 8px; background: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 13px; border: 1px solid #10b98120; }
        
        .sub-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; }
        .sub-srch { display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; width: 280px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .sub-srch input { border: none; background: transparent; font-size: 13.5px; color: #111827; outline: none; font-family: inherit; width: 100%; }

        .sub-card { background: white; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
        .sub-tbl { width: 100%; border-collapse: collapse; }
        .sub-tbl th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .sub-tbl td { padding: 14px 16px; font-size: 13.5px; color: #4b5563; border-bottom: 1px solid #f3f4f6; }
        .sub-tbl tbody tr:last-child td { border-bottom: none; }
        .sub-tbl tbody tr:hover td { background: #fafafa; }

        .sub-av { width: 32px; height: 32px; border-radius: 8px; color: white; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sub-badge-active { background: #dcfce7; color: #15803d; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .02em; }
        
        .sub-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; border: 1px solid #e5e7eb; background: white; color: #4b5563; text-decoration: none; }
        .sub-btn:hover { background: #f9fafb; color: #111827; border-color: #d1d5db; }
        
        @keyframes sub-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .sub-fa { animation: sub-in .25s ease both; }
      `}</style>

      <div className="sub-fa">
        <div className="sub-ph">
          <div>
            <h1>Subscribed Users</h1>
            <p>List of all customers with active Pro subscriptions.</p>
          </div>
          <div className="sub-badge-count">
            <Icon d={icons.zap} size={16} stroke="#059669" fill="#059669" />
            {users.length} Active Pro Users
          </div>
        </div>

        <div className="sub-row">
          <div className="sub-srch">
            <Icon d={icons.search[0]} size={14} stroke="#9ca3af" />
            <input 
              placeholder="Search by name or email…" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className="sub-card">
          {loading ? (
            <div style={{ padding: 64, textAlign: "center", color: "#9ca3af" }}>
              <div style={{ marginBottom: 12 }}>Loading subscribers...</div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="sub-tbl">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact Info</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className="sub-av" style={{ background: AV_COLORS[i % AV_COLORS.length], overflow: "hidden" }}>
                            {u.profile?.avatarUrl ? (
                              <img src={toPublicUrl(u.profile.avatarUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              u.profile?.name?.[0] || u.email[0]
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>
                              {u.profile?.name || "No Name"}
                            </div>
                            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em" }}>
                              {u.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {/* <Icon d={icons.mail[0]} size={13} stroke="#9ca3af" /> */}
                            <span style={{ fontSize: 13 }}>{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="sub-badge-active">Active Pro</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9ca3af" }}>
                          {/* <Icon d={icons.calendar[0]} size={13} stroke="currentColor" /> */}
                          <span style={{ fontSize: 12.5 }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <Link href={`/admin/users/${u.id}`} className="sub-btn">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
                        <div style={{ marginBottom: 8 }}>No subscribers found matching your search.</div>
                        <div style={{ fontSize: 12 }}>Try another keyword.</div>
                      </td>
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
