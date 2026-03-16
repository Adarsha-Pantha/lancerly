import React from "react";
import { ShieldAlert, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModerationErrorProps {
  message?: string;
  className?: string;
}

export function ModerationError({ message, className }: ModerationErrorProps) {
  if (!message) return null;

  // Detect if this is a moderation-related error
  const isModeration = message.toLowerCase().includes("moderation") || 
                       message.toLowerCase().includes("rejected") || 
                       message.toLowerCase().includes("blocked") ||
                       message.toLowerCase().includes("prohibited");

  if (!isModeration) {
    return (
      <div className={cn("p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300", className)}>
        <AlertTriangle size={18} />
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-red-200 bg-red-50/50 shadow-sm animate-in zoom-in-95 duration-500", className)}>
      <div className="flex items-start gap-4 p-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <ShieldAlert size={22} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-red-900 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
            AI Content Security
          </h4>
          <p className="text-sm text-red-800 leading-relaxed font-medium">
            {message.replace("Project creation rejected: ", "").replace("Proposal rejected: ", "").replace("Message blocked: ", "")}
          </p>
          
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-red-700/70 py-2 border-t border-red-100">
              <Info size={14} />
              <span>Lancerly uses AI to maintain a safe and professional environment.</span>
            </div>
            
            <a 
              href="/community-guidelines" 
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors group"
            >
              Learn more about our guidelines
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-red-600/5 px-5 py-2 border-t border-red-100">
        <p className="text-[10px] uppercase font-bold text-red-800/40 tracking-widest text-right">
          Protected by LancerGuard AI
        </p>
      </div>
    </div>
  );
}
