"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { get, post, del } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import {
  Search,
  UserPlus,
  Users,
  MessageCircle,
  Loader2,
  User,
  Check,
  X,
  UserMinus,
  Clock,
  Bell,
  ChevronRight,
} from "lucide-react";

const VIOLET = "#6B4EFF";

type Status = "none" | "pending_sent" | "pending_received" | "accepted";

type SearchUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  headline: string | null;
  friendshipStatus: Status;
};

type Request = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  headline: string | null;
  createdAt: string;
};

type Friend = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  headline: string | null;
  since: string;
};

type Tab = "friends" | "requests" | "find";

export default function FriendsPage() {
  const { token, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<Request[]>([]);
  const [sent, setSent] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [searching, setSearching] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // ── redirect ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login?redirect=/friends");
    }
  }, [authLoading, token, router]);

  // ── data loaders ──────────────────────────────────────────────────────────
  const loadFriends = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingFriends(true);
      const data = await get<Friend[]>("/friends", token);
      setFriends(Array.isArray(data) ? data : []);
    } catch (e: any) {
      if (/unauthorized|token|expired/i.test(e?.message ?? "")) { logout(); }
    } finally {
      setLoadingFriends(false);
    }
  }, [token, logout]);

  const loadRequests = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingRequests(true);
      const [inc, snt] = await Promise.all([
        get<Request[]>("/friends/requests/incoming", token),
        get<Request[]>("/friends/requests/sent", token),
      ]);
      setIncoming(Array.isArray(inc) ? inc : []);
      setSent(Array.isArray(snt) ? snt : []);
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadFriends();
      loadRequests();
    }
  }, [token, loadFriends, loadRequests]);

  // ── debounced search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const tid = setTimeout(async () => {
      if (!token) return;
      try {
        setSearching(true);
        const data = await get<SearchUser[]>(`/friends/search?q=${encodeURIComponent(searchQuery)}`, token);
        setSearchResults(Array.isArray(data) ? data : []);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(tid);
  }, [searchQuery, token]);

  // ── actions ───────────────────────────────────────────────────────────────
  async function sendRequest(userId: string) {
    if (!token || actionId) return;
    try {
      setActionId(userId);
      await post(`/friends/request/${userId}`, {}, token);
      setSearchResults((prev) =>
        prev.map((u) => u.id === userId ? { ...u, friendshipStatus: "pending_sent" } : u)
      );
      await loadRequests();
    } catch (e: any) {
      alert(e?.message || "Could not send request");
    } finally {
      setActionId(null);
    }
  }

  async function acceptRequest(requestId: string, senderId: string) {
    if (!token || actionId) return;
    try {
      setActionId(requestId);
      await post(`/friends/accept/${requestId}`, {}, token);
      await Promise.all([loadFriends(), loadRequests()]);
      setSearchResults((prev) =>
        prev.map((u) => u.id === senderId ? { ...u, friendshipStatus: "accepted" } : u)
      );
    } catch (e: any) {
      alert(e?.message || "Could not accept request");
    } finally {
      setActionId(null);
    }
  }

  async function declineRequest(requestId: string) {
    if (!token || actionId) return;
    try {
      setActionId(requestId);
      await post(`/friends/decline/${requestId}`, {}, token);
      setIncoming((prev) => prev.filter((r) => r.id !== requestId));
    } catch (e: any) {
      alert(e?.message || "Could not decline request");
    } finally {
      setActionId(null);
    }
  }

  async function cancelRequest(requestId: string) {
    if (!token || actionId) return;
    try {
      setActionId(requestId);
      await del(`/friends/cancel/${requestId}`, token);
      setSent((prev) => prev.filter((r) => r.id !== requestId));
      setSearchResults((prev) =>
        prev.map((u) => u.id === requestId ? { ...u, friendshipStatus: "none" } : u)
      );
    } catch (e: any) {
      alert(e?.message || "Could not cancel request");
    } finally {
      setActionId(null);
    }
  }

  async function removeFriend(targetId: string) {
    if (!token || actionId || !confirm("Remove this friend?")) return;
    try {
      setActionId(targetId);
      await del(`/friends/${targetId}`, token);
      setFriends((prev) => prev.filter((f) => f.id !== targetId));
      setSearchResults((prev) =>
        prev.map((u) => u.id === targetId ? { ...u, friendshipStatus: "none" } : u)
      );
    } catch (e: any) {
      alert(e?.message || "Could not remove friend");
    } finally {
      setActionId(null);
    }
  }

  async function openConversation(friendId: string) {
    if (!token) return;
    try {
      const conversations = await get<Array<{ id: string; participant: { id: string } }>>("/conversations", token);
      const conv = conversations.find((c) => c.participant?.id === friendId);
      if (conv) { router.push(`/messages/${conv.id}`); return; }
      const newConv = await post<{ id: string }>("/conversations", { freelancerId: friendId }, token);
      router.push(`/messages/${newConv.id}`);
    } catch (e: any) {
      alert(e?.message || "Could not open conversation");
    }
  }

  // ── ui helpers ────────────────────────────────────────────────────────────
  function avatar(url: string | null | undefined, name: string | null) {
    return toPublicUrl(url) || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "U")}`;
  }

  function PersonCard({
    id, name, avatarUrl, headline, email,
    right,
  }: {
    id: string; name: string | null; avatarUrl: string | null;
    headline: string | null; email?: string; right: React.ReactNode;
  }) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
        <img src={avatar(avatarUrl, name)} alt={name || ""} className="w-12 h-12 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{name || "User"}</p>
          {headline ? (
            <p className="text-xs text-slate-400 truncate">{headline}</p>
          ) : email ? (
            <p className="text-xs text-slate-400 truncate">{email}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">{right}</div>
      </div>
    );
  }

  if (authLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} style={{ color: VIOLET }} />
      </div>
    );
  }

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: "friends", label: "Friends", badge: friends.length },
    { id: "requests", label: "Requests", badge: incoming.length || undefined },
    { id: "find", label: "Find People" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 mb-1">Network</h1>
          <p className="text-sm text-slate-400">Connect with clients and freelancers</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              style={tab === t.id ? { backgroundColor: VIOLET } : {}}
            >
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.id ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── FRIENDS TAB ───────────────────────────────────────────────────── */}
        {tab === "friends" && (
          <div className="space-y-2">
            {loadingFriends ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin" size={28} style={{ color: VIOLET }} />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-16">
                <Users size={40} className="mx-auto mb-3 text-slate-200" />
                <p className="font-semibold text-slate-500 mb-1">No friends yet</p>
                <p className="text-sm text-slate-400">Go to <button onClick={() => setTab("find")} className="underline" style={{ color: VIOLET }}>Find People</button> to connect</p>
              </div>
            ) : (
              friends.map((f) => (
                <PersonCard
                  key={f.id}
                  id={f.id}
                  name={f.name}
                  avatarUrl={f.avatarUrl}
                  headline={f.headline}
                  right={
                    <>
                      <button
                        onClick={() => openConversation(f.id)}
                        className="p-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5"
                        style={{ backgroundColor: VIOLET }}
                        title="Message"
                      >
                        <MessageCircle size={15} />
                      </button>
                      <button
                        onClick={() => removeFriend(f.id)}
                        disabled={actionId === f.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove friend"
                      >
                        {actionId === f.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : <UserMinus size={15} />}
                      </button>
                    </>
                  }
                />
              ))
            )}
          </div>
        )}

        {/* ── REQUESTS TAB ─────────────────────────────────────────────────── */}
        {tab === "requests" && (
          <div className="space-y-6">
            {/* Incoming */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell size={15} className="text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Incoming</h2>
                {incoming.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: VIOLET }}>{incoming.length}</span>
                )}
              </div>
              {loadingRequests ? (
                <div className="flex justify-center py-6"><Loader2 className="animate-spin" size={22} style={{ color: VIOLET }} /></div>
              ) : incoming.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No incoming requests</p>
              ) : (
                <div className="space-y-2">
                  {incoming.map((r) => (
                    <PersonCard
                      key={r.id}
                      id={r.id}
                      name={r.name}
                      avatarUrl={r.avatarUrl}
                      headline={r.headline}
                      email={r.email}
                      right={
                        <>
                          <button
                            onClick={() => acceptRequest(r.id, r.id)}
                            disabled={actionId === r.id}
                            className="px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1 transition-all hover:opacity-90"
                            style={{ backgroundColor: VIOLET }}
                          >
                            {actionId === r.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            Accept
                          </button>
                          <button
                            onClick={() => declineRequest(r.id)}
                            disabled={actionId === r.id}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <X size={13} />
                            Decline
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sent */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} className="text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sent</h2>
              </div>
              {loadingRequests ? null : sent.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No pending sent requests</p>
              ) : (
                <div className="space-y-2">
                  {sent.map((r) => (
                    <PersonCard
                      key={r.id}
                      id={r.id}
                      name={r.name}
                      avatarUrl={r.avatarUrl}
                      headline={r.headline}
                      email={r.email}
                      right={
                        <button
                          onClick={() => cancelRequest(r.id)}
                          disabled={actionId === r.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          {actionId === r.id ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                          Cancel
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FIND PEOPLE TAB ──────────────────────────────────────────────── */}
        {tab === "find" && (
          <div>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-sm text-slate-800 outline-none focus:border-purple-300 transition-colors"
              />
            </div>

            {searching && (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin" size={24} style={{ color: VIOLET }} />
              </div>
            )}

            {!searching && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-10">
                <User size={32} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm text-slate-400">No users found</p>
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((u) => (
                  <PersonCard
                    key={u.id}
                    id={u.id}
                    name={u.name}
                    avatarUrl={u.avatarUrl}
                    headline={u.headline}
                    email={u.email}
                    right={
                      u.friendshipStatus === "accepted" ? (
                        <>
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl">
                            <Check size={12} /> Friends
                          </span>
                          <button onClick={() => openConversation(u.id)} className="p-2 rounded-xl text-white" style={{ backgroundColor: VIOLET }}>
                            <MessageCircle size={14} />
                          </button>
                        </>
                      ) : u.friendshipStatus === "pending_sent" ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl">
                          <Clock size={12} /> Pending
                        </span>
                      ) : u.friendshipStatus === "pending_received" ? (
                        <>
                          <button
                            onClick={() => acceptRequest(u.id, u.id)}
                            disabled={actionId === u.id}
                            className="px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1"
                            style={{ backgroundColor: VIOLET }}
                          >
                            <Check size={13} /> Accept
                          </button>
                          <button onClick={() => { setTab("requests"); }} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold flex items-center gap-1">
                            <ChevronRight size={13} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => sendRequest(u.id)}
                          disabled={actionId === u.id}
                          className="px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-all"
                          style={{ backgroundColor: VIOLET }}
                        >
                          {actionId === u.id ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                          {actionId === u.id ? "Sending…" : "Add Friend"}
                        </button>
                      )
                    }
                  />
                ))}
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-16">
                <Search size={36} className="mx-auto mb-3 text-slate-200" />
                <p className="text-sm text-slate-400">Search for people to connect with</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
