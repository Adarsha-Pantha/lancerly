"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { get, post } from "@/lib/api";
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
} from "lucide-react";

type UserSearchResult = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isFriend: boolean;
};

type Friend = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export default function FriendsPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [addingFriend, setAddingFriend] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?redirect=/friends");
      return;
    }
    loadFriends();
  }, [token, authLoading, router]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, token]);

  async function loadFriends() {
    if (!token) return;
    try {
      setLoading(true);
      const data = await get<Friend[]>("/friends", token);
      setFriends(data);
    } catch (err: any) {
      console.error("Failed to load friends:", err);
      const msg = err?.message || "";
      const authErrors = ["Unauthorized", "token", "expired", "User not found", "Missing token", "Invalid token"];
      if (authErrors.some((p) => msg.toLowerCase().includes(p.toLowerCase()))) {
        logout();
        router.replace("/login?redirect=/friends");
      }
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers(query: string) {
    if (!token || !query.trim()) return;
    try {
      setSearching(true);
      const data = await get<UserSearchResult[]>(`/friends/search?q=${encodeURIComponent(query)}`, token);
      setSearchResults(data);
    } catch (err: any) {
      console.error("Failed to search users:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function addFriend(userId: string) {
    if (!token || addingFriend) return;
    try {
      setAddingFriend(userId);
      await post(`/friends/${userId}`, {}, token);
      
      // Refresh friends list and search results
      await loadFriends();
      if (searchQuery.trim()) {
        await searchUsers(searchQuery);
      }
    } catch (err: any) {
      console.error("Failed to add friend:", err);
      alert(err?.message || "Failed to add friend");
    } finally {
      setAddingFriend(null);
    }
  }

  async function startConversation(friendId: string) {
    if (!token) return;
    try {
      // First ensure they are friends (this will create conversation if needed)
      const isFriend = friends.some(f => f.id === friendId);
      if (!isFriend) {
        await addFriend(friendId);
        // Wait a bit for the backend to create the conversation
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Find the conversation with this friend (check all conversations)
      const conversations = await get<Array<{ id: string; participant: { id: string } }>>("/conversations", token);
      const conversation = conversations.find(
        conv => conv.participant.id === friendId
      );
      
      if (conversation) {
        router.push(`/messages/${conversation.id}`);
      } else {
        // If no conversation found, create one directly
        try {
          const newConversation = await post<{ id: string }>("/conversations", {
            freelancerId: friendId,
          }, token);
          router.push(`/messages/${newConversation.id}`);
        } catch (createErr: any) {
          // If creation fails, try to reload conversations and find it
          const updatedConversations = await get<Array<{ id: string; participant: { id: string } }>>("/conversations", token);
          const found = updatedConversations.find(
            conv => conv.participant.id === friendId
          );
          if (found) {
            router.push(`/messages/${found.id}`);
          } else {
            throw createErr;
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to start conversation:", err);
      alert(err?.message || "Failed to start conversation");
    }
  }

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("User")}`;

  if (authLoading || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600">
            {authLoading ? "Loading..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Friends</h1>
          <p className="text-slate-600">Connect with other users and start conversations</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-slate-500" size={20} />
            <h2 className="text-xl font-semibold text-slate-900">Search Users</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Search Results */}
          {searching && (
            <div className="mt-4 flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-purple-600" size={24} />
            </div>
          )}

          {!searching && searchQuery.trim() && searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-purple-50 transition-colors"
                >
                  <Link
                    href={`/users/${result.id}`}
                    className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={toPublicUrl(result.avatarUrl) || fallbackAvatar}
                      alt={result.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{result.name}</p>
                      <p className="text-sm text-slate-500">{result.email}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    {result.isFriend ? (
                      <>
                        <span className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg flex items-center gap-1">
                          <Check size={16} />
                          Friend
                        </span>
                        <button
                          onClick={() => startConversation(result.id)}
                          className="px-4 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <MessageCircle size={16} />
                          Message
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => addFriend(result.id)}
                        disabled={addingFriend === result.id}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                      >
                        {addingFriend === result.id ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Adding...
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} />
                            Add Friend
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searching && searchQuery.trim() && searchResults.length === 0 && (
            <div className="mt-4 text-center py-8 text-slate-500">
              <User className="mx-auto mb-2 text-slate-300" size={32} />
              <p>No users found</p>
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-slate-500" size={20} />
            <h2 className="text-xl font-semibold text-slate-900">My Friends</h2>
            <span className="px-2 py-0.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-full">
              {friends.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-600 mb-2">No friends yet</p>
              <p className="text-sm text-slate-500">
                Search for users above to add them as friends
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-purple-50 transition-colors"
                >
                  <Link
                    href={`/users/${friend.id}`}
                    className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={toPublicUrl(friend.avatarUrl) || fallbackAvatar}
                      alt={friend.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{friend.name}</p>
                      <p className="text-sm text-slate-500">{friend.email}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => startConversation(friend.id)}
                    className="px-4 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MessageCircle size={16} />
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

