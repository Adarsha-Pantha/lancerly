"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminProposalsPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") router.replace("/admin/login");
  }, [token, user]);

  if (!token || user?.role !== "ADMIN") return null;

  return (
    <>
      <style>{`
        .prop-ph h1 { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .prop-ph p { font-size: 13px; color: #9ca3af; }
        .prop-coming { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; text-align: center; margin-top: 20px; }
        .prop-coming .icon { font-size: 48px; margin-bottom: 16px; }
        .prop-coming h2 { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 6px; }
        .prop-coming p { font-size: 13px; color: #9ca3af; max-width: 360px; line-height: 1.6; }
        .prop-tag { display: inline-flex; margin-top: 16px; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #fef3c7; color: #b45309; }
      `}</style>

      <div>
        <div className="prop-ph" style={{ marginBottom: 20 }}>
          <h1>Proposals</h1>
          <p>Review all freelancer proposals submitted across the platform.</p>
        </div>
        <div className="prop-coming">
          <div className="icon">📄</div>
          <h2>Full Proposals Management — Coming Soon</h2>
          <p>This section will include a full proposals browser with filtering by project, status, and freelancer, along with the ability to flag or remove inappropriate bids.</p>
          <span className="prop-tag">⚙ Under Construction</span>
        </div>
      </div>
    </>
  );
}
