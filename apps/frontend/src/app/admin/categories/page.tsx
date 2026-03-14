"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const categories = [
  { name: "Web Development", projects: 1204, growth: "+14%", color: "#2563eb", skills: ["React", "Node.js", "Vue", "Angular"] },
  { name: "UI/UX Design", projects: 874, growth: "+9%", color: "#7c3aed", skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"] },
  { name: "Mobile Dev", projects: 612, growth: "+21%", color: "#059669", skills: ["React Native", "Flutter", "Swift", "Kotlin"] },
  { name: "AI / ML", projects: 388, growth: "+38%", color: "#d97706", skills: ["Python", "TensorFlow", "PyTorch", "LLM"] },
  { name: "Content Writing", projects: 341, growth: "+6%", color: "#db2777", skills: ["Copywriting", "SEO", "Technical Writing", "Blogging"] },
  { name: "Marketing", projects: 298, growth: "+4%", color: "#0891b2", skills: ["Google Ads", "Social Media", "Email Marketing", "Analytics"] },
];

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") router.replace("/admin/login");
  }, [token, user]);

  if (!token || user?.role !== "ADMIN") return null;

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
        .cat-growth { font-size: 11px; font-weight: 600; color: #15803d; }
        .cat-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .13s; border: 1px solid #e5e7eb; background: transparent; color: #4b5563; }
        .cat-btn:hover { background: #f9fafb; color: #111827; }
        @keyframes cat-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .cat-fa { animation: cat-in .22s ease both; }
      `}</style>

      <div className="cat-fa">
        <div className="cat-ph">
          <h1>Taxonomy & Categories</h1>
          <p>Manage skills, industries, and project categories.</p>
        </div>

        <div className="cat-card">
          {categories.map((c, i) => (
            <div className="cat-row" key={c.name}>
              <div className="cat-ico" style={{ background: `${c.color}15` }}>
                <span style={{ fontSize: 20 }}>
                  {["💻", "🎨", "📱", "🤖", "✍️", "📣"][i]}
                </span>
              </div>
              <div className="cat-info">
                <div className="cat-name">{c.name}</div>
                <div className="cat-skills">
                  {c.skills.map(s => <span className="cat-skill" key={s}>{s}</span>)}
                </div>
                <ProgressBar value={c.projects} max={1204} color={c.color} />
              </div>
              <div className="cat-stats">
                <div className="cat-count">{c.projects.toLocaleString()}</div>
                <div className="cat-growth">{c.growth}</div>
              </div>
              <button className="cat-btn">Edit</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
