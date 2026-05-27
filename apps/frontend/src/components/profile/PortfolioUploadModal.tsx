"use client";

import { useMemo, useState } from "react";
import { X, Upload, ExternalLink, Image as ImageIcon } from "lucide-react";

export function PortfolioUploadModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: FormData) => Promise<void> | void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => title.trim().length >= 2 && description.trim().length >= 5 && !saving, [title, description, saving]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={() => !saving && onClose()}
        aria-label="Close"
      />

      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portfolio</p>
            <h3 className="text-base font-black text-slate-900">Add a project</h3>
          </div>
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="p-2 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <X className="size-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Landing page redesign"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="What did you build? What was the impact?"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skills (comma separated)</label>
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Tailwind, Figma"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live link (optional)</label>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1">
                  <input
                    value={liveLink}
                    onChange={(e) => setLiveLink(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                  />
                </div>
                <ExternalLink className="size-4 text-slate-400 shrink-0" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover image (optional)</label>
              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ImageIcon className="size-4 text-slate-400" />
                    <span className="truncate">{image ? image.name : "No file selected"}</span>
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Upload className="size-4" />
                    Choose file
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-3 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={async () => {
                if (!canSave) return;
                setSaving(true);
                setError(null);
                try {
                  const form = new FormData();
                  form.append("title", title.trim());
                  form.append("description", description.trim());
                  form.append(
                    "skills",
                    JSON.stringify(skills.split(",").map((s) => s.trim()).filter(Boolean))
                  );
                  if (liveLink.trim()) form.append("liveLink", liveLink.trim());
                  if (image) form.append("image", image);

                  await onSubmit(form);
                  setTitle("");
                  setDescription("");
                  setSkills("");
                  setLiveLink("");
                  setImage(null);
                  onClose();
                } catch (e: any) {
                  setError(e?.message || "Failed to upload portfolio project");
                } finally {
                  setSaving(false);
                }
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-black hover:brightness-110 transition-all disabled:opacity-60"
            >
              {saving ? "Saving…" : "Add project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

