"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, post, patch, del } from "@/lib/api";
import { Loader2, ArrowLeft, Play, Square, Clock, Trash2, Calendar } from "lucide-react";

type TimeEntry = {
  id: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isRunning: boolean;
  createdAt: string;
};

type TimeData = {
  entries: TimeEntry[];
  totalMinutes: number;
  totalHours: number;
};

export default function TimeTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const { token, user } = useAuth();
  const contractId = params.id as string;

  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [runningTimer, setRunningTimer] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "FREELANCER") {
      router.push(`/contracts/${contractId}`);
      return;
    }
    void loadData();
    const interval = setInterval(loadData, 1000); // Update every second
    return () => clearInterval(interval);
  }, [token, user, contractId]);

  async function loadData() {
    if (!token) return;
    try {
      const [timeDataResult, runningTimerResult] = await Promise.all([
        get<TimeData>(`/contracts/${contractId}/time`, token),
        get<TimeEntry | null>(`/contracts/${contractId}/time/running`, token).catch(() => null),
      ]);
      setTimeData(timeDataResult);
      setRunningTimer(runningTimerResult);
    } catch (err: any) {
      if (!error) setError(err?.message || "Failed to load time data");
    } finally {
      setLoading(false);
    }
  }

  async function startTimer() {
    if (!token) return;
    setStarting(true);
    try {
      await post(
        `/contracts/${contractId}/time/start`,
        { description: description || undefined },
        token
      );
      setDescription("");
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to start timer");
    } finally {
      setStarting(false);
    }
  }

  async function stopTimer() {
    if (!token || !runningTimer) return;
    try {
      await patch(`/contracts/time/${runningTimer.id}/stop`, undefined, token);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to stop timer");
    }
  }

  async function deleteEntry(entryId: string) {
    if (!token) return;
    if (!confirm("Delete this time entry?")) return;
    try {
      await del(`/contracts/time/${entryId}`, token);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete entry");
    }
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function getElapsedTime(startTime: string): string {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diff = Math.floor((now - start) / 1000 / 60);
    return formatDuration(diff);
  }

  if (loading && !timeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push(`/contracts/${contractId}`)}
          className="text-purple-600 hover:text-purple-700 mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Contract
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Time Tracking</h1>

          {timeData && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Time</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatDuration(timeData.totalMinutes)}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {timeData.totalHours} hours total
                  </p>
                </div>
                <Clock className="text-purple-600" size={48} />
              </div>
            </div>
          )}

          {runningTimer ? (
            <div className="mb-6 p-4 border-2 border-green-500 rounded-lg bg-green-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Timer Running</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {getElapsedTime(runningTimer.startTime)}
                  </p>
                  {runningTimer.description && (
                    <p className="text-sm text-slate-600 mt-2">{runningTimer.description}</p>
                  )}
                </div>
                <button
                  onClick={stopTimer}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Square size={18} />
                  Stop Timer
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 border border-slate-200 rounded-lg">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on? (optional)"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={startTimer}
                  disabled={starting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {starting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Play size={18} />
                      Start Timer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {timeData && timeData.entries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="text-slate-400 mx-auto mb-4" size={48} />
              <p className="text-slate-600">No time entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeData?.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {entry.isRunning && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      )}
                      <p className="font-medium text-slate-900">
                        {entry.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(entry.startTime).toLocaleString()}</span>
                      </div>
                      {entry.duration !== null && entry.duration !== undefined && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{formatDuration(entry.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {!entry.isRunning && (
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

