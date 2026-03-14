"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, post } from "@/lib/api";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  
  const [freelancerFee, setFreelancerFee] = useState(10);
  const [clientFee, setClientFee] = useState(3);
  
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }
    fetchSettings();
  }, [token, user]);

  const fetchSettings = async () => {
    try {
      const data = await get<{ freelancerServiceFee: number; clientProcessingFee: number }>("/admin/settings/platform", token!);
      setFreelancerFee(data.freelancerServiceFee);
      setClientFee(data.clientProcessingFee);
    } catch (e) {
      console.error("Failed to fetch settings", e);
    } finally {
      setLoading(false);
    }
  };

  if (!token || user?.role !== "ADMIN") return null;

  const handleSave = async () => {
    try {
      await post("/admin/settings/platform", {
        freelancerServiceFee: freelancerFee,
        clientProcessingFee: clientFee
      }, token!);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  return (
    <>
      <style>{`
        .set-ph h1 { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .set-ph p { font-size: 13px; color: #9ca3af; }
        .set-section { background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.07); margin-top: 20px; }
        .set-sh { padding: 14px 20px; border-bottom: 1px solid #e5e7eb; font-size: 13.5px; font-weight: 700; color: #111827; }
        .set-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
        .set-row:last-child { border-bottom: none; }
        .set-label { font-size: 13.5px; font-weight: 600; color: #111827; }
        .set-sub { font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .set-toggle { position: relative; width: 42px; height: 24px; background: #e5e7eb; border-radius: 12px; cursor: pointer; transition: background .2s; border: none; flex-shrink: 0; }
        .set-toggle.on { background: #2563eb; }
        .set-toggle::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
        .set-toggle.on::after { left: 21px; }
        .set-input { padding: 7px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; color: #111827; outline: none; font-family: inherit; width: 260px; }
        .set-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px #eff6ff; }
        .set-foot { display: flex; align-items: center; gap: 12px; padding: 16px 20px; }
        .set-save { padding: 7px 18px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .set-save:hover { background: #1d4ed8; }
        .set-saved { font-size: 12px; color: #059669; font-weight: 600; }
        @keyframes set-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .set-fa { animation: set-in .22s ease both; }
      `}</style>

      <div className="set-fa">
        <div className="set-ph">
          <h1>Settings</h1>
          <p>Configure platform-wide preferences and toggles.</p>
        </div>

        {/* Platform Settings */}
        <div className="set-section">
          <div className="set-sh">Platform Settings</div>
          <div className="set-row">
            <div>
              <div className="set-label">Maintenance Mode</div>
              <div className="set-sub">Puts the platform into read-only maintenance mode for all users.</div>
            </div>
            <button className={`set-toggle${maintenance ? " on" : ""}`} onClick={() => setMaintenance(m => !m)} />
          </div>
          <div className="set-row">
            <div>
              <div className="set-label">AI Features Enabled</div>
              <div className="set-sub">Enable or disable all AI-powered features platform-wide.</div>
            </div>
            <button className={`set-toggle${aiEnabled ? " on" : ""}`} onClick={() => setAiEnabled(a => !a)} />
          </div>
          <div className="set-row">
            <div>
              <div className="set-label">Email Notifications</div>
              <div className="set-sub">Allow the platform to send transactional emails to users.</div>
            </div>
            <button className={`set-toggle${emailNotifs ? " on" : ""}`} onClick={() => setEmailNotifs(e => !e)} />
          </div>
        </div>

        {/* Admin Settings */}
        <div className="set-section">
          <div className="set-sh">Admin Configuration</div>
          <div className="set-row">
            <div>
              <div className="set-label">Platform Name</div>
              <div className="set-sub">The name shown in emails and the app header.</div>
            </div>
            <input className="set-input" defaultValue="Lancerly" />
          </div>
          <div className="set-row">
            <div>
              <div className="set-label">Support Email</div>
              <div className="set-sub">Users are directed to this address for help requests.</div>
            </div>
            <input className="set-input" type="email" defaultValue="support@lancerly.io" />
          </div>
          <div className="set-row">
            <div>
              <div className="set-label">Freelancer Service Fee (%)</div>
              <div className="set-sub">Percentage deducted from freelancer earnings on payout (e.g. 10 = 10%).</div>
            </div>
            <input 
              className="set-input" 
              type="number" 
              value={freelancerFee} 
              onChange={(e) => setFreelancerFee(parseFloat(e.target.value))}
              style={{ width: 100 }} 
            />
          </div>
          <div className="set-row">
            <div>
              <div className="set-label">Client Processing Fee (%)</div>
              <div className="set-sub">Additional fee added to client checkout (e.g. 3 = 3%).</div>
            </div>
            <input 
              className="set-input" 
              type="number" 
              value={clientFee} 
              onChange={(e) => setClientFee(parseFloat(e.target.value))}
              style={{ width: 100 }} 
            />
          </div>
          <div className="set-foot">
            <button className="set-save" onClick={handleSave} disabled={loading}>
              {loading ? "Loading..." : "Save changes"}
            </button>
            {saved && <span className="set-saved">✓ Settings saved!</span>}
          </div>
        </div>
      </div>
    </>
  );
}
