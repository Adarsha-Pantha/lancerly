"use client";

import { ChangeEvent, FormEvent, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { post, postForm, get } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  DollarSign,
  Sparkles,
  Check,
  AlertCircle,
  FileText,
  Crown,
  Zap,
  Plus,
  X,
  ListTodo,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AiBriefRefiner } from "./AiBriefRefiner";
import { ModerationError } from "@/components/ui/ModerationError";
import AiBudgetEstimator from "@/components/ai/AiBudgetEstimator";

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

export default function PostProjectWizard({ 
  onSuccessRedirect = "/projects/mine" 
}: { 
  onSuccessRedirect?: string 
}) {
  const router = useRouter();
  const { token, user } = useAuth();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [skills, setSkills] = useState("");
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>([]);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [quota, setQuota] = useState<{ limit: number | null; used: number; remaining: number | null; isSubscribed: boolean } | null>(null);

  useEffect(() => {
    if (token) {
      get("/projects/my-quota", token)
        .then(setQuota)
        .catch(console.error);
    }
  }, [token]);

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
        screeningQuestions,
        acceptanceCriteria,
      };
      if (budgetMin) projectData.budgetMin = Number(budgetMin);
      if (budgetMax) projectData.budgetMax = Number(budgetMax);

      created = await post<ProjectResponse>("/projects", projectData, token ?? undefined);
    } catch (err: any) {
      if (err?.status === 403 || err?.statusCode === 403) {
        setShowLimitReached(true);
        setSaving(false);
        return;
      }
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

    router.replace(onSuccessRedirect);
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with Quota */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Post a Project</h1>
          <p className="text-sm text-muted-foreground">Follow the steps to find the perfect freelancer.</p>
        </div>
        
        {quota && !quota.isSubscribed && quota.limit !== null && (
          <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <div className={`size-2 rounded-full ${quota.remaining && quota.remaining > 0 ? 'bg-emerald-500' : 'bg-destructive'}`} />
            <span className="text-xs font-medium text-primary-foreground mix-blend-difference">
              {quota.remaining} of {quota.limit} projects remaining this week
            </span>
          </div>
        )}
        {quota?.isSubscribed && (
          <div className="px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center gap-2">
            <Crown size={14} className="text-emerald-600 fill-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Unlimited Pro Plan</span>
          </div>
        )}
      </div>

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
                projectTitle={title}
                onRefined={(data) => {
                  setScreeningQuestions(data.screeningQuestions);
                  setAcceptanceCriteria(data.acceptanceCriteria);
                }}
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

            {/* AI Generated Sections */}
            {(screeningQuestions.length > 0 || acceptanceCriteria.length > 0) && (
              <div className="space-y-6 animate-fadeIn border-l-2 border-indigo-100 pl-6 py-2">
                {/* Screening Questions */}
                {screeningQuestions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-900">
                      <HelpCircle size={18} className="text-indigo-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Screening Questions</h3>
                    </div>
                    <div className="space-y-2">
                      {screeningQuestions.map((q, i) => (
                        <div key={i} className="group flex items-center gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                          <span className="text-indigo-400 font-mono text-xs w-4">0{i + 1}</span>
                          <input
                            className="flex-grow bg-transparent text-sm focus:outline-none text-indigo-900 font-medium"
                            value={q}
                            onChange={(e) => {
                              const next = [...screeningQuestions];
                              next[i] = e.target.value;
                              setScreeningQuestions(next);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setScreeningQuestions(prev => prev.filter((_, idx) => idx !== i))}
                            className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-destructive transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setScreeningQuestions([...screeningQuestions, ""])}
                        className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-2 px-1"
                      >
                        <Plus size={14} /> Add Question
                      </button>
                    </div>
                  </div>
                )}

                {/* Acceptance Criteria */}
                {acceptanceCriteria.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-900">
                      <ListTodo size={18} className="text-indigo-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Acceptance Criteria</h3>
                    </div>
                    <div className="space-y-2">
                      {acceptanceCriteria.map((c, i) => (
                        <div key={i} className="group flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <Check size={14} className="text-emerald-500 shrink-0" />
                          <input
                            className="flex-grow bg-transparent text-sm focus:outline-none text-slate-700 font-medium"
                            value={c}
                            onChange={(e) => {
                              const next = [...acceptanceCriteria];
                              next[i] = e.target.value;
                              setAcceptanceCriteria(next);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setAcceptanceCriteria(prev => prev.filter((_, idx) => idx !== i))}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-destructive transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAcceptanceCriteria([...acceptanceCriteria, ""])}
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-700 mt-2 px-1"
                      >
                        <Plus size={14} /> Add Criteria
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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

            <div className="mb-6">
              <AiBudgetEstimator 
                formData={{ title, description, skills }} 
                onApplyEstimates={(min: string, max: string) => {
                  setBudgetMin(min);
                  setBudgetMax(max);
                }} 
              />
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

      {/* Upgrade Overlay */}
      {showLimitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
          <Card className="max-w-md w-full border-2 border-primary/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899]" />
            <CardHeader className="text-center pt-8">
              <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Crown size={32} className="text-yellow-500 fill-yellow-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Weekly Limit Reached</CardTitle>
              <CardDescription className="text-base mt-2">
                You&apos;ve reached the project creation limit for free accounts. 
                Upgrade to Pro for unlimited project posts and premium features!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="space-y-3">
                {[
                  "Unlimited project posts per week",
                  "Priority support & resolution",
                  "Advanced AI brief refiner",
                  "Pro badge on your projects",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="size-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="text-emerald-600" size={12} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-90 h-11 text-base font-semibold"
                  asChild
                >
                  <Link href="/settings?tab=subscription">
                    <Zap size={18} className="mr-2 fill-current" />
                    Upgrade to Pro — $59/mo
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowLimitReached(false)}
                >
                  Maybe later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
