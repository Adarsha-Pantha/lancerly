"use client";

import { PackageOpen, UploadCloud, FileText, ExternalLink } from "lucide-react";

export type DeliveryItem = {
  id: string;
  title: string;
  note?: string | null;
  createdAt: string;
  files?: { name: string; url: string }[];
};

export function DeliveriesTab({
  // Some pages pass these (contract workspace)
  contractId,
  token,
  isFreelancer,
  isClient,
  // Optional direct data injection
  deliveries = [],
  onUpload,
}: {
  contractId?: string;
  token?: string;
  isFreelancer?: boolean;
  isClient?: boolean;
  deliveries?: DeliveryItem[];
  onUpload?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-amber-100">
            <PackageOpen className="size-4 text-amber-700" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Deliveries</h3>
            <p className="text-[11px] text-slate-400">{deliveries.length} submitted</p>
          </div>
        </div>
        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2 text-xs font-black text-white hover:bg-amber-700 transition-colors"
          >
            <UploadCloud className="size-4" />
            Upload
          </button>
        )}
      </div>

      <div className="p-5">
        {(contractId || token) && (
          <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
            {contractId && (
              <span>
                Contract: <span className="font-semibold">{contractId}</span>
              </span>
            )}
            {(isFreelancer || isClient) && (
              <span>
                Role: <span className="font-semibold">{isFreelancer ? "Freelancer" : "Client"}</span>
              </span>
            )}
          </div>
        )}
        {deliveries.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <FileText className="size-5 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No deliveries yet</p>
            <p className="text-xs text-slate-400 mt-1">Share files, links, or notes with your client</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{d.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{d.createdAt}</p>
                    {d.note && <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap">{d.note}</p>}
                  </div>
                </div>
                {d.files && d.files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {d.files.map((f, i) => (
                      <a
                        key={i}
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink className="size-3.5" />
                        {f.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

