"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, post } from "@/lib/api";
import {
  Loader2, Mic, MicOff, PhoneOff, Users, Calendar,
  Volume2, Timer, Signal, CheckCircle2,
} from "lucide-react";

const BRAND = "#6B4EFF";

type Meeting = {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  roomUrl: string;
  roomName: string;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type PageState = "loading" | "prejoin" | "joining" | "incall" | "error" | "ended";

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const meetingId = params.meetingId as string;
  const contractId = params.id as string;

  const [meeting, setMeeting]         = useState<Meeting | null>(null);
  const [pageState, setPageState]     = useState<PageState>("loading");
  const [muted, setMuted]             = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [micError, setMicError]       = useState<string | null>(null);
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  // ref so event-handler closures always have current values
  const callRef       = useRef<any>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const didJoinRef    = useRef(false);   // true once joined-meeting fires

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    get<Meeting>(`/meetings/${meetingId}`, token)
      .then((data) => {
        setMeeting(data);
        if (data.status === "CANCELLED") {
          setError("This meeting has been cancelled.");
          setPageState("error");
        } else {
          setPageState("prejoin");
        }
      })
      .catch((e: any) => {
        setError(e?.message || "Meeting not found");
        setPageState("error");
      });
  }, [token, meetingId]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      callRef.current?.leave().catch(() => {});
      callRef.current?.destroy().catch(() => {});
    };
  }, []);

  async function joinCall() {
    if (!meeting || !token) return;
    setPageState("joining");
    setMicError(null);

    // 1. Mic permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      setMicError("Microphone access was denied. Allow microphone in your browser settings and try again.");
      setPageState("prejoin");
      return;
    }

    // 2. Get Daily token from backend
    let meetingToken: string;
    let roomUrl: string;
    let devMode = false;
    try {
      const res = await get<{ token: string; roomUrl: string; devMode?: boolean }>(
        `/meetings/${meetingId}/token`,
        token,
      );
      meetingToken = res.token;
      roomUrl      = res.roomUrl;
      devMode      = !!res.devMode;
    } catch (e: any) {
      setError(e?.message || "Failed to get meeting token");
      setPageState("error");
      return;
    }

    if (devMode) {
      setError("DAILY_API_KEY_NOT_SET");
      setPageState("error");
      return;
    }

    // 3. Join via Daily.co JS SDK
    try {
      const DailyIframe = (await import("@daily-co/daily-js")).default;

      if (callRef.current) {
        await callRef.current.destroy().catch(() => {});
        callRef.current = null;
      }

      const call = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: false,
      });
      callRef.current = call;

      const refreshParticipants = () => {
        const raw = call.participants() as Record<string, any>;
        const list = Object.values(raw).map((p: any) => ({
          id: p.session_id,
          name: p.local ? (user?.name ?? "You") : (p.user_name || "Participant"),
        }));
        setParticipants(list);
      };

      call
        .on("joined-meeting", () => {
          didJoinRef.current = true;
          refreshParticipants();
          const startMs = Date.now();
          timerRef.current = setInterval(() => {
            setCallDuration(Math.floor((Date.now() - startMs) / 1000));
          }, 1000);
          setPageState("incall");
        })
        .on("participant-joined", refreshParticipants)
        .on("participant-updated", refreshParticipants)
        .on("participant-left", refreshParticipants)
        .on("left-meeting", () => {
          if (timerRef.current) clearInterval(timerRef.current);
          // Show ended screen only if user had actually joined
          if (didJoinRef.current) {
            setPageState("ended");
          }
        })
        .on("error", (err: any) => {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!didJoinRef.current) {
            setError(
              err?.errorMsg ||
                "Could not connect to the meeting room. Check that Daily.co is configured (DAILY_API_KEY) and try again.",
            );
            setPageState("error");
          }
        });

      await call.join({ url: roomUrl, token: meetingToken });
    } catch (e: any) {
      setError(e?.message || "Failed to join call");
      setPageState("error");
    }
  }

  async function toggleMute() {
    if (!callRef.current) return;
    const next = !muted;
    await callRef.current.setLocalAudio(!next);
    setMuted(next);
  }

  async function leaveCall() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (callRef.current) {
      await callRef.current.leave().catch(() => {});
      await callRef.current.destroy().catch(() => {});
      callRef.current = null;
    }
    // Tell the backend this user has left (meeting ends when both sides leave)
    try { await post(`/meetings/${meetingId}/leave`, {}, token!); } catch { /* non-critical */ }
    setPageState("ended");
  }

  /* ─────────────────── STATES ─────────────────── */

  if (pageState === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900 z-50">
        <Loader2 className="animate-spin w-10 h-10 text-purple-400" />
      </div>
    );
  }

  if (pageState === "error") {
    const isSetupError =
      error === "DAILY_API_KEY_NOT_SET" ||
      error?.toLowerCase().includes("daily_api_key") ||
      error?.toLowerCase().includes("not configured");
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 gap-5 text-white z-50">
        <PhoneOff size={52} className="text-red-400" />
        {isSetupError ? (
          <>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Audio Calls Not Configured</h2>
              <p className="text-slate-400 text-sm max-w-xs">
                Daily.co is not set up on this server yet.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-sm w-full text-sm space-y-3 mx-4">
              <p className="text-slate-300 font-semibold">Quick Setup (free):</p>
              <ol className="space-y-2 text-slate-400 list-decimal list-inside">
                <li>Go to <a href="https://dashboard.daily.co" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">dashboard.daily.co</a> and sign up free</li>
                <li>Copy your <span className="text-slate-200 font-mono">API Key</span> from the Developers page</li>
                <li>Add to <code className="bg-slate-900 px-1.5 py-0.5 rounded text-purple-300">apps/backend/.env</code>:
                  <div className="mt-1 bg-slate-900 rounded-lg px-3 py-2 font-mono text-purple-300 text-xs break-all select-all">
                    DAILY_API_KEY=your_key_here
                  </div>
                </li>
                <li>Restart the backend server</li>
              </ol>
            </div>
          </>
        ) : (
          <p className="text-lg font-semibold text-center max-w-sm px-4">{error || "Something went wrong"}</p>
        )}
        <div className="flex gap-3">
          {!isSetupError && (
            <button
              onClick={() => setPageState("prejoin")}
              className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-sm transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => router.push(`/contracts/${contractId}`)}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold text-sm transition-colors"
          >
            Back to Contract
          </button>
        </div>
      </div>
    );
  }

  if (pageState === "ended") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 gap-6 text-white z-50">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 size={48} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">You Left the Call</h2>
          {callDuration > 0 && (
            <p className="text-slate-400 mt-1 text-sm">Duration: {formatDuration(callDuration)}</p>
          )}
          <p className="text-slate-500 mt-2 text-xs max-w-xs">
            The meeting stays active for the other participant until they also leave.
          </p>
        </div>
        <button
          onClick={() => router.push(`/contracts/${contractId}`)}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold text-sm transition-colors"
        >
          Back to Contract
        </button>
      </div>
    );
  }

  const scheduledDate = new Date(meeting?.scheduledAt ?? "");
  const isJoinable    = meeting?.status === "SCHEDULED" || meeting?.status === "ACTIVE";

  /* ─────────────────── PRE-JOIN / JOINING ─────────────────── */
  if (pageState === "prejoin" || pageState === "joining") {
    return (
      <div className="fixed inset-0 flex flex-col bg-slate-900 text-white z-50">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <span className="text-sm font-semibold text-slate-300">Audio Meeting</span>
          <button
            onClick={() => router.push(`/contracts/${contractId}`)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Back to contract
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-7 text-center max-w-sm w-full">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl"
              style={{ background: "linear-gradient(135deg, #4f27a8, #6B4EFF)" }}
            >
              {pageState === "joining"
                ? <Loader2 size={44} className="text-white animate-spin" />
                : <Mic size={44} className="text-white" />
              }
            </div>

            <div>
              <h2 className="text-2xl font-bold">{meeting?.title}</h2>
              <p className="text-slate-400 mt-1.5 text-sm flex items-center justify-center gap-1.5">
                <Calendar size={12} />
                {scheduledDate.toLocaleString("en-US", {
                  weekday: "short", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-slate-800 rounded-2xl p-4 w-full border border-slate-700 space-y-2.5 text-left">
              {[
                "Camera is off — audio only",
                "Microphone permission will be requested",
                "Both participants can hear each other in real time",
              ].map((txt) => (
                <div key={txt} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">✓</span>
                  {txt}
                </div>
              ))}
            </div>

            {micError && (
              <div className="w-full bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-300 text-left">
                {micError}
              </div>
            )}

            {!isJoinable ? (
              <p className="text-red-400 text-sm font-medium">
                This meeting is {meeting?.status?.toLowerCase()} and can no longer be joined.
              </p>
            ) : (
              <button
                onClick={joinCall}
                disabled={pageState === "joining"}
                className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: BRAND }}
              >
                {pageState === "joining"
                  ? <><Loader2 size={18} className="animate-spin" /> Connecting...</>
                  : <><Mic size={18} /> Join Audio Call</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────── IN-CALL ─────────────────── */
  return (
    <div className="fixed inset-0 flex flex-col bg-slate-900 text-white z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Signal size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
          <span className="text-slate-600 text-xs">|</span>
          <span className="text-sm font-semibold text-white truncate max-w-[200px]">{meeting?.title}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          {/* Participants */}
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-slate-400" />
            <span>{participants.length} participant{participants.length !== 1 ? "s" : ""}</span>
          </span>
          {/* Timer */}
          <span className="flex items-center gap-1.5 font-mono font-bold text-amber-400 text-sm tabular-nums">
            <Timer size={13} />
            {formatDuration(callDuration)}
          </span>
          {/* Mute (compact) */}
          <button
            onClick={toggleMute}
            title={muted ? "Unmute" : "Mute"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              muted
                ? "bg-red-500/20 border border-red-500/40 text-red-400"
                : "bg-slate-700 hover:bg-slate-600 text-white"
            }`}
          >
            {muted ? <MicOff size={12} /> : <Mic size={12} />}
            {muted ? "Unmute" : "Mute"}
          </button>
          {/* Leave */}
          <button
            onClick={leaveCall}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <PhoneOff size={12} />
            Leave
          </button>
        </div>
      </div>

      {/* Main call area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 p-8">

        {/* Big live timer */}
        <div className="text-center">
          <p className="text-7xl font-mono font-bold tabular-nums tracking-widest text-white drop-shadow-lg">
            {formatDuration(callDuration)}
          </p>
          <p className="text-slate-500 text-sm mt-2 flex items-center justify-center gap-1.5">
            <Timer size={12} />
            Call duration
          </p>
        </div>

        {/* Participants row */}
        <div className="flex items-end justify-center gap-8 flex-wrap">
          {participants.length === 0 ? (
            <div className="text-center text-slate-500 text-sm">Waiting for participants…</div>
          ) : (
            participants.map((p, i) => {
              const isLocal = p.name === (user?.name ?? "You") || i === 0;
              const isMutedLocal = isLocal && muted;
              return (
                <div key={p.id} className="flex flex-col items-center gap-3">
                  <div className={`relative w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl transition-all ${
                    isMutedLocal
                      ? "bg-slate-700 ring-4 ring-red-500/40"
                      : "bg-gradient-to-br from-purple-600 to-indigo-700 ring-4 ring-emerald-400/60 shadow-emerald-400/20"
                  }`}>
                    {p.name?.[0]?.toUpperCase() ?? "?"}
                    {/* Mic indicator */}
                    <span className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md ${
                      isMutedLocal ? "bg-red-600" : "bg-emerald-500"
                    }`}>
                      {isMutedLocal ? <MicOff size={13} /> : <Mic size={13} />}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">{isLocal ? `${p.name} (You)` : p.name}</p>
                    <p className={`text-xs mt-0.5 ${isMutedLocal ? "text-red-400" : "text-emerald-400"}`}>
                      {isMutedLocal ? "Muted" : "Speaking enabled"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Waiting banner when alone */}
        {participants.length === 1 && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-6 py-4 text-center max-w-xs">
            <Loader2 size={18} className="animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">Waiting for the other participant…</p>
            <p className="text-xs text-slate-500 mt-1">Share the meeting link with them to join.</p>
          </div>
        )}

        {/* Bottom controls */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={toggleMute}
              title={muted ? "Unmute microphone" : "Mute microphone"}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                muted
                  ? "bg-red-600 hover:bg-red-700 ring-4 ring-red-400/30"
                  : "bg-slate-700 hover:bg-slate-600 ring-4 ring-slate-500/20"
              }`}
            >
              {muted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <span className="text-xs text-slate-400">{muted ? "Unmute" : "Mute"}</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={leaveCall}
              title="Leave call"
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl ring-4 ring-red-400/30 transition-all active:scale-95"
            >
              <PhoneOff size={24} />
            </button>
            <span className="text-xs text-slate-400">Leave</span>
          </div>
        </div>
      </div>
    </div>
  );
}
