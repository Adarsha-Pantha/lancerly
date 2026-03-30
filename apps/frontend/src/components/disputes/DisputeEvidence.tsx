"use client";

import { useState, useEffect } from "react";
import { postForm } from "@/lib/api";
import { Loader2, Paperclip, X, Download, FileText, ImageIcon, FileIcon } from "lucide-react";

type Evidence = {
  id: string;
  fileUrl: string;
  fileName?: string;
  createdAt: string;
  uploadedBy: { email: string; profile: { name?: string } | null };
};

export default function DisputeEvidence({
  disputeId,
  evidence: initialEvidence,
  token,
  isAdmin = false,
}: {
  disputeId: string;
  evidence: Evidence[];
  token: string;
  isAdmin?: boolean;
}) {
  const [evidence, setEvidence] = useState<Evidence[]>(initialEvidence);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEvidence(initialEvidence);
  }, [initialEvidence]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic file size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large (max 5MB)");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      const newEvidence = await postForm<Evidence>(`/disputes/${disputeId}/evidence`, formData, token);
      setEvidence((prev) => [...prev, newEvidence]);
    } catch (err: any) {
      setError(err?.message || "Failed to upload evidence");
    } finally {
      setUploading(false);
      // Clear input
      e.target.value = "";
    }
  }

  const getFileIcon = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return <ImageIcon size={16} className="text-blue-500" />;
    if (ext === "pdf") return <FileText size={16} className="text-red-500" />;
    return <FileIcon size={16} className="text-slate-500" />;
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Paperclip size={16} />
          Evidence Files ({evidence.length})
        </h4>
        {!isAdmin && (
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors flex items-center gap-2">
              {uploading ? <Loader2 size={12} className="animate-spin" /> : "+ Add Evidence"}
            </span>
          </label>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {evidence.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No evidence uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {evidence.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 min-width-0 overflow-hidden">
                <div className="shrink-0">{getFileIcon(ev.fileUrl)}</div>
                <div className="min-width-0">
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-[150px]" title={ev.fileName || ev.fileUrl}>
                    {ev.fileName || "Evidence File"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    By {ev.uploadedBy.profile?.name || ev.uploadedBy.email.split("@")[0]} • {new Date(ev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <a 
                href={ev.fileUrl.startsWith("http") ? ev.fileUrl : `http://localhost:3001${ev.fileUrl}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                title="View/Download"
              >
                <Download size={14} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
