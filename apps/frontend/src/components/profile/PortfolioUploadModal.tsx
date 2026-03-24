"use client";

import { useState, useRef } from "react";
import { UploadCloud, Link as LinkIcon, Briefcase, Type, Sparkles, X } from "lucide-react";

type PortfolioUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
};

export function PortfolioUploadModal({ open, onClose, onSubmit }: PortfolioUploadModalProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setTitle("");
    setDescription("");
    setSkills("");
    setLiveLink("");
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      if (skills.trim()) fd.append("skills", skills);
      if (liveLink.trim()) fd.append("liveLink", liveLink);
      if (image) fd.append("image", image);

      await onSubmit(fd);
      handleReset();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Add Portfolio Project</h2>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          <form id="portfolio-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Project Image (Optional)</label>
              <div
                className={`border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
                  preview ? "border-slate-200" : "border-slate-300 hover:border-primary bg-slate-50"
                }`}
              >
                {preview ? (
                  <div className="relative aspect-video group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-slate-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors shadow-sm"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video flex flex-col items-center justify-center gap-2 text-slate-500"
                  >
                    <div className="p-3 bg-white rounded-full shadow-sm">
                      <UploadCloud className="text-primary size-6" />
                    </div>
                    <div className="text-sm font-medium">Click to upload image</div>
                    <div className="text-xs text-slate-400">PNG, JPG up to 5MB</div>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Project Name</label>
              <div className="relative">
                <Type className="absolute left-3 top-3  text-slate-400 size-5" />
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. E-commerce Mobile App"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Skills Used</label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-3  text-slate-400 size-5" />
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, React Native, Node.js (comma separated)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 text-slate-400 size-5" />
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your role and what you built..."
                  rows={4}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>

            {/* Live Link */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Live Link (Optional)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3  text-slate-400 size-5" />
                <input
                  type="url"
                  value={liveLink}
                  onChange={(e) => setLiveLink(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="portfolio-form"
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="size-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
