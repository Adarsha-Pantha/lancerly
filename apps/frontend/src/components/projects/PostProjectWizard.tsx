"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { post, postForm } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  DollarSign,
  Sparkles,
  Check,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiBriefRefiner } from "./AiBriefRefiner";
import { ModerationError } from "@/components/ui/ModerationError";

type Errors = Partial<Record<"title" | "description" | "budgetMin" | "budgetMax" | "form", string>>;
type ProjectResponse = { id: string };

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const COMMON_SKILLS = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript", "HTML/CSS",
  "UI/UX Design", "Graphic Design", "Content Writing", "SEO", "Digital Marketing",
  "Mobile Development", "Data Analysis", "Machine Learning", "DevOps",
];

const STEPS = [
  { id: 1, title: "Overview", icon: FileText },
  { id: 2, title: "Budget", icon: DollarSign },
  { id: 3, title: "Skills & Files", icon: Sparkles },
];

export default function PostProjectWizard() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [skills, setSkills] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const skillsArray = useMemo(
    () => skills.split(",").map((s) => s.trim()).filter(Boolean),
    [skills]
  );

  if (!token || !user) {
    router.replace("/login?redirect=/projects/new");
    return null;
  }

  if (user?.role !== "CLIENT") {
    router.replace("/projects");
    return null;
  }

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) {
      setFiles([]);
      setFileError(null);
      return;
    }
    let oversized = false;
    const trimmed = picked.slice(0, MAX_FILES);
    const valid: File[] = [];
    trimmed.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) oversized = true;
      else valid.push(file);
    });
    setFileError(
      picked.length > MAX_FILES
        ? `Only the first ${MAX_FILES} files were kept.`
        : oversized
          ? "Some files exceeded 10 MB and were skipped."
          : null
    );
    setFiles(valid);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function validateStep1(): boolean {
    const next: Errors = {};
    if (!title.trim()) next.title = "Title is required";
    else if (title.trim().length < 3) next.title = "Use at least 3 characters";
    if (!description.trim()) next.description = "Description is required";
    else if (description.trim().length < 10) next.description = "Use at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep2(): boolean {
    const next: Errors = {};
    const min = budgetMin ? Number(budgetMin) : undefined;
    const max = budgetMax ? Number(budgetMax) : undefined;
    if (budgetMin && (Number.isNaN(min!) || min! < 0))
      next.budgetMin = "Enter a valid number";
    if (budgetMax && (Number.isNaN(max!) || max! < 0))
      next.budgetMax = "Enter a valid number";
    if (min != null && max != null && min > max)
      next.budgetMax = "Max must be ≥ min";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function canProceed(): boolean {
    if (step === 1) return !!title.trim() && !!description.trim() && description.trim().length >= 10;
    if (step === 2) return true;
    return true;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < 3) {
      if (step === 1 && !validateStep1()) return;
      if (step === 2 && !validateStep2()) return;
      setStep(step + 1);
      return;
    }

    if (!validateStep1() || !validateStep2()) return;

    setSaving(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    let created: ProjectResponse | null = null;

    try {
      const projectData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        skills: skillsArray,
      };
      if (budgetMin) projectData.budgetMin = Number(budgetMin);
      if (budgetMax) projectData.budgetMax = Number(budgetMax);

      created = await post<ProjectResponse>("/projects", projectData, token ?? undefined);
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        form: err instanceof Error ? err.message : "Unable to create project",
      }));
      setSaving(false);
      return;
    }

    if (files.length && created) {
      try {
        const form = new FormData();
        files.forEach((file) => form.append("attachments", file));
        await postForm(`/projects/${created.id}/attachments`, form, token ?? undefined);
      } catch (err: unknown) {
        setErrors((prev) => ({
          ...prev,
          form:
            err instanceof Error
              ? err.message
              : "Project saved, but file upload failed. You can add files later.",
        }));
        setSaving(false);
        return;
      }
    }

    router.replace("/projects/mine");
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-3">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 text-sm ${
                step >= s.id ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step > s.id ? "bg-primary text-white" : step === s.id ? "bg-[#7C3AED] text-white" : "bg-[#E2E8F0]"
                }`}
              >
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
        <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#7C3AED] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <ModerationError message={errors.form} className="mb-6" />

        {/* Step 1: Overview */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                What do you need done?
              </h2>
              <p className="text-sm text-muted-foreground">
                A clear title and description help freelancers understand your project.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Project title <span className="text-destructive">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build a landing page for my SaaS"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-destructive">*</span>
              </label>
              <AiBriefRefiner
                value={description}
                onChange={setDescription}
                placeholder="Describe the work you need, scope, deliverables, and any constraints..."
                error={errors.description}
                minLength={10}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                What&apos;s your budget?
              </h2>
              <p className="text-sm text-muted-foreground">
                Optional. Setting a range helps freelancers decide if they can help.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Minimum ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="number"
                    min={0}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="e.g. 500"
                    className={`pl-10 ${errors.budgetMin ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.budgetMin && (
                  <p className="mt-1 text-sm text-destructive">{errors.budgetMin}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Maximum ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="number"
                    min={0}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="e.g. 1500"
                    className={`pl-10 ${errors.budgetMax ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.budgetMax && (
                  <p className="mt-1 text-sm text-destructive">{errors.budgetMax}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Skills & Files */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Skills & attachments
              </h2>
              <p className="text-sm text-muted-foreground">
                Add skills so the right freelancers find your project. Attach briefs or references if you have them.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Required skills
              </label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, TypeScript (comma-separated)"
              />
              {skillsArray.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {skillsArray.join(", ")}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {COMMON_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      const current = skills.split(",").map((s) => s.trim()).filter(Boolean);
                      if (!current.includes(skill)) {
                        setSkills((prev) => (prev ? `${prev}, ${skill}` : skill));
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] text-sm text-foreground hover:bg-[#E2E8F0] transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Attachments (optional)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Briefs, requirements docs, or reference materials. Max 10 files, 10 MB each.
              </p>
              <input
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.txt"
                onChange={handleFiles}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {fileError && <p className="mt-2 text-sm text-amber-600">{fileError}</p>}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                    >
                      <span className="text-sm text-foreground truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-sm font-medium text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review summary */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Review your project</h3>
              <p className="text-sm font-medium text-foreground">{title || "Untitled"}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description || "No description"}
              </p>
              {(budgetMin || budgetMax) && (
                <p className="text-sm text-muted-foreground mt-2">
                  Budget: ${budgetMin || "0"} – ${budgetMax || "—"}
                </p>
              )}
              {skillsArray.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Skills: {skillsArray.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-[#E2E8F0]">
          <div>
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} />
                Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" asChild>
                <Link href="/projects/mine">Cancel</Link>
              </Button>
            )}
          </div>
          <Button type="submit" disabled={!canProceed() || saving}>
            {saving ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Posting...
              </>
            ) : step < 3 ? (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <Briefcase size={16} />
                Post Project
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
