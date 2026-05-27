"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";

type CategoryStat = { name: string; projects: number; color: string; icon: string; skills: string[] };

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") { router.replace("/admin/login"); return; }
    get<CategoryStat[]>("/admin/stats/categories", token)
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, user]);

  if (!token || user?.role !== "ADMIN") return null;

  const maxProjects = Math.max(...categories.map(c => c.projects), 1);

  return (
    <>
      <style>{`
        .cat-ph { margin-bottom: 20px; }
        .cat-ph h1 { font-size: 18px; font-weight: 700; color: #111827; }
        .cat-ph p { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .cat-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
        .cat-row { padding: 16px 18px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 16px; }
        .cat-row:last-child { border-bottom: none; }
        .cat-row:hover { background: #fafafa; }
        .cat-ico { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }
        .cat-info { flex: 1; }
        .cat-name { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 6px; }
        .cat-skills { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
        .cat-skill { font-size: 10.5px; font-weight: 600; background: #f3f4f6; color: #4b5563; padding: 2px 7px; border-radius: 20px; }
        .cat-stats { text-align: right; min-width: 80px; }
        .cat-count { font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -.03em; }
        .cat-sub { font-size: 11px; color: #9ca3af; }
        @keyframes cat-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .cat-fa { animation: cat-in .22s ease both; }
      `}</style>

      <div className="cat-fa">
        <div className="cat-ph">
          <h1>Taxonomy & Categories</h1>
          <p>Skills distribution across all projects on the platform.</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div style={{ width: 32, height: 32, border: "3px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "cat-in .8s linear infinite" }} />
          </div>
        ) : (
          <div className="cat-card">
            {categories.map((c) => (
              <div className="cat-row" key={c.name}>
                <div className="cat-ico" style={{ background: `${c.color}15` }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                </div>
                <div className="cat-info">
                  <div className="cat-name">{c.name}</div>
                  {c.skills.length > 0 && (
                    <div className="cat-skills">
                      {c.skills.slice(0, 6).map(s => <span className="cat-skill" key={s}>{s}</span>)}
                    </div>
                  )}
                  <ProgressBar value={c.projects} max={maxProjects} color={c.color} />
                </div>
                <div className="cat-stats">
                  <div className="cat-count">{c.projects.toLocaleString()}</div>
                  <div className="cat-sub">projects</div>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No projects found yet.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
