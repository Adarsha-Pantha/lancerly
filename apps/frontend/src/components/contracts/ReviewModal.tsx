"use client";

import { X, Star } from "lucide-react";
import { useMemo, useState } from "react";

export function ReviewModal({
  open,
  // Back-compat props used by contract workspace
  isOpen,
  onClose,
  contractId,
  token,
  onSuccess,
  onSubmit,
  title = "Leave a review",
  submitLabel = "Submit review",
}: {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  contractId?: string;
  token?: string;
  onSuccess?: () => void;
  onSubmit?: (data: { rating: number; comment: string; contractId?: string; token?: string }) => Promise<void> | void;
  title?: string;
  submitLabel?: string;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const disabled = useMemo(() => submitting || rating < 1 || rating > 5, [submitting, rating]);

  const actuallyOpen = (isOpen ?? open) === true;
  if (!actuallyOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={() => !submitting && onClose()}
        aria-label="Close"
      />

      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            className="p-2 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <X className="size-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rating</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 rounded-lg hover:bg-amber-50 transition-colors"
                  aria-label={`Rate ${s}`}
                >
                  <Star className={s <= rating ? "size-6 fill-amber-400 text-amber-500" : "size-6 text-slate-200"} />
                </button>
              ))}
              <span className="ml-2 text-sm font-black text-slate-700">{rating}.0</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comment</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share what went well (optional)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                if (disabled) return;
                setSubmitting(true);
                try {
                  if (onSubmit) {
                    await onSubmit({ rating, comment: comment.trim(), contractId, token });
                  }
                  // If used from contracts page, it may pass these instead.
                  if (onSuccess) onSuccess();
                  onClose();
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={disabled}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-black hover:brightness-110 transition-all disabled:opacity-60"
            >
              {submitting ? "Submitting…" : submitLabel}
            </button>
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="px-5 py-3 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

