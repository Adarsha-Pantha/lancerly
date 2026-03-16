"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p: string, i: number) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  trending: ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  proposals: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8"],
  projects: ["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"],
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  finance: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"],
  ai: ["M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z","M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z","M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z","M16 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"],
};

const features = [
  { icon: "trending", color: "#2563eb", title: "Semantic Matching", status: "Active", usage: "4,200 matches/day", desc: "MiniLM embeddings stored in pgvector match project descriptions to freelancer profiles. Results ranked by cosine similarity, filtered by skills and ratings." },
  { icon: "proposals", color: "#7c3aed", title: "Proposal Assistant", status: "Active", usage: "320 drafts/day", desc: "GPT-powered drafts with intro, plan, timeline, and clarifying questions. Freelancers edit before submitting — reducing blank-page friction by 80%." },
  { icon: "projects", color: "#059669", title: "Project Brief Refiner", status: "Active", usage: "180 briefs/day", desc: "AI rewrites vague client briefs for clarity and completeness. Suggests screening questions and acceptance criteria to prevent scope disputes." },
  { icon: "star", color: "#d97706", title: "Review Summarizer", status: "Active", usage: "50 summaries/day", desc: "Condenses hundreds of reviews into a readable profile highlight using LLM summarization — letting clients evaluate talent instantly." },
  { icon: "finance", color: "#db2777", title: "Budget Estimator", status: "Beta", usage: "Coming soon", desc: "Phase 2: Uses historical project data to estimate cost range and delivery time for new postings before the client sets a budget." },
  { icon: "eye", color: "#0891b2", title: "Content Moderation", status: "Active", usage: "8,500 checks/day", desc: "Automated detection of spam, harmful content, and policy violations across messages, project descriptions, proposals, and reviews." },
];

export default function AdminAIPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") router.replace("/admin/login");
  }, [token, user]);

  if (!token || user?.role !== "ADMIN") return null;

  return (
    <>
      <style>{`
        .ai-ph { margin-bottom: 20px; }
        .ai-ph h1 { font-size: 18px; font-weight: 700; color: #111827; }
        .ai-ph p { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .ai-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (max-width: 900px) { .ai-grid { grid-template-columns: 1fr; } }
        .ai-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.07); transition: box-shadow .15s, transform .15s; }
        .ai-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); transform: translateY(-1px); }
        .ai-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .ai-ico { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .ai-status { display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
        .ai-status.Active { background: #dcfce7; color: #15803d; }
        .ai-status.Beta { background: #fef3c7; color: #b45309; }
        .ai-title { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 6px; }
        .ai-usage { font-size: 11.5px; font-weight: 600; color: #6b7280; margin-bottom: 10px; }
        .ai-desc { font-size: 12.5px; color: #4b5563; line-height: 1.65; }
        .ai-tag { display: inline-flex; align-items: center; gap: 4px; margin-top: 12px; font-size: 11px; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 2px 8px; border-radius: 20px; }
        @keyframes ai-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .ai-fa { animation: ai-in .22s ease both; }
      `}</style>

      <div className="ai-fa">
        <div className="ai-ph">
          <h1>AI Features</h1>
          <p>Powered by sentence-transformers, pgvector, GPT, and moderation APIs.</p>
        </div>

        <div className="ai-grid">
          {features.map((f, i) => (
            <div className="ai-card" key={f.title} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="ai-head">
                <div className="ai-ico" style={{ background: `${f.color}12` }}>
                  <Icon d={icons[f.icon as keyof typeof icons]} size={19} stroke={f.color} />
                </div>
                <span className={`ai-status ${f.status}`}>{f.status === "Active" ? "● Active" : "⚙ Beta"}</span>
              </div>
              <div className="ai-title">{f.title}</div>
              <div className="ai-usage">📊 {f.usage}</div>
              <div className="ai-desc">{f.desc}</div>
              <div className="ai-tag">
                <Icon d={icons.ai[0]} size={11} stroke="#2563eb" />
                AI Powered
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
