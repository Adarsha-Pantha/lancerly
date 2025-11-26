"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { post, postForm } from "@/lib/api";

type Errors = Partial<Record<"title" | "description" | "budgetMin" | "budgetMax" | "form", string>>;
type ProjectResponse = { id: string };

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function NewProjectPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [skills, setSkills] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const postingAsFreelancer = user?.role === "FREELANCER";

  const skillsArray = useMemo(
    () =>
      skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [skills],
  );

  if (!token || !user) {
    router.replace("/login?redirect=/projects/new");
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
      if (file.size > MAX_FILE_SIZE) {
        oversized = true;
        return;
      }
      valid.push(file);
    });

    if (picked.length > MAX_FILES) {
      setFileError(`Only the first ${MAX_FILES} files were kept.`);
    } else if (oversized) {
      setFileError("Some files exceeded 10 MB and were skipped.");
    } else {
      setFileError(null);
    }

    setFiles(valid);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, index) => index !== idx));
  }

  function validate() {
    const next: Errors = {};
    if (!title.trim()) next.title = "Title is required";
    else if (title.trim().length < 3) next.title = "Use at least 3 characters";
    if (!description.trim()) next.description = "Description is required";
    else if (description.trim().length < 10) next.description = "Use at least 10 characters";

    const min = budgetMin ? Number(budgetMin) : undefined;
    const max = budgetMax ? Number(budgetMax) : undefined;
    if (budgetMin && (Number.isNaN(min) || min! < 0)) {
      next.budgetMin = "Enter a non-negative number";
    }
    if (budgetMax && (Number.isNaN(max) || max! < 0)) {
      next.budgetMax = "Enter a non-negative number";
    }
    if (min !== undefined && max !== undefined && min > max) {
      next.budgetMax = "Max must be ≥ min";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;
    setSaving(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    let created: ProjectResponse | null = null;

    try {
      created = await post<ProjectResponse>(
        "/projects",
        {
          title: title.trim(),
          description: description.trim(),
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          skills: skillsArray,
        },
        token ?? undefined,
      );
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, form: err?.message || "Unable to create project" }));
      setSaving(false);
      return;
    }

    if (files.length && created) {
      try {
        const form = new FormData();
        files.forEach((file) => form.append("attachments", file));
        await postForm(`/projects/${created.id}/attachments`, form, token ?? undefined);
      } catch (err: any) {
        setErrors((prev) => ({
          ...prev,
          form:
            err?.message ||
            "Project saved, but uploading files failed. Open My Projects to retry from Edit.",
        }));
        setSaving(false);
        return;
      }
    }

    router.replace("/projects/mine");
    setSaving(false);
  }

  const titleCopy = postingAsFreelancer
    ? "Showcase a Software Build"
    : "Post Work for Freelancers";
  const subtitleCopy = postingAsFreelancer
    ? "Tell clients what you built, why it matters, and share artefacts like screenshots, demos, or repos."
    : "Describe the work you need, add context, and attach references or briefs so freelancers can deliver faster.";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {postingAsFreelancer ? "Posting as Freelancer" : "Posting as Client"}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">{titleCopy}</h1>
          <p className="text-gray-600 mt-2">{subtitleCopy}</p>
        </div>

        {errors.form && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              className={`mt-1 w-full rounded-lg border px-3 py-2 ${submitted && errors.title ? "border-red-400" : ""}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={postingAsFreelancer ? "Eg. AI-powered Expense Tracker" : "Eg. Build a React company portal"}
            />
            {submitted && errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              className={`mt-1 w-full rounded-lg border px-3 py-2 ${submitted && errors.description ? "border-red-400" : ""}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                postingAsFreelancer
                  ? "Stack, architecture, features delivered, live link, GitHub, lessons learned..."
                  : "Goals, scope, timelines, deliverables, collaboration expectations..."
              }
            />
            {submitted && errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget min (optional)</label>
              <input
                type="number"
                min={0}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${submitted && errors.budgetMin ? "border-red-400" : ""}`}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="e.g. 500"
              />
              {submitted && errors.budgetMin && <p className="mt-1 text-sm text-red-600">{errors.budgetMin}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget max (optional)</label>
              <input
                type="number"
                min={0}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${submitted && errors.budgetMax ? "border-red-400" : ""}`}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="e.g. 1500"
              />
              {submitted && errors.budgetMax && <p className="mt-1 text-sm text-red-600">{errors.budgetMax}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, Tailwind"
            />
            {skillsArray.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">You listed: {skillsArray.join(", ")}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {postingAsFreelancer ? "Screenshots / Build files" : "Briefs / References"} (optional)
            </label>
            <p className="text-xs text-gray-500">
              Up to {MAX_FILES} files (images, pdf, zip, docs). Each must be smaller than 10 MB.
            </p>
            <input
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.zip,.rar,.doc,.docx,.ppt,.pptx,.txt"
              onChange={handleFiles}
              className="mt-2 w-full cursor-pointer rounded-lg border px-3 py-2 text-sm"
            />
            {fileError && <p className="mt-1 text-sm text-amber-600">{fileError}</p>}

            {files.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {files.map((file, idx) => (
                  <li key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span className="truncate pr-3">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Posting…" : "Publish Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
