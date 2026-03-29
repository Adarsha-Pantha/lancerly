"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Flag,
  CheckCircle,
  Star,
  ExternalLink,
  Loader2,
  Heart,
  HelpCircle,
  ListTodo,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { get, post, patch } from "@/lib/api";
import { ProposalForm } from "@/components/proposals/ProposalForm";

const BRAND = "#7739DB";

interface ProjectDrawerProps {
  projectId: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  skills: string[];
  experienceLevel: string;
  createdAt: string;
  status: string;
  screeningQuestions?: string[];
  acceptanceCriteria?: string[];
  client: {
    id: string;
    createdAt: string;
    stripeCustomerId?: string | null;
    profile: {
      name: string;
      country: string;
      kycStatus?: string;
    } | null;
    stats?: {
      postedJobs: number;
      openJobs: number;
      hireRate: number;
    };
    rating?: number;
    reviewCount?: number;
  } | null;
  _count?: {
    proposals: number;
  };
}

interface Proposal {
  id: string;
  coverLetter: string;
  proposedBudget?: number;
  status: string;
  createdAt: string;
  freelancer: {
    id: string;
    profile: {
      name: string;
      avatarUrl: string | null;
    } | null;
  } | null;
}

export function ProjectDrawer({ projectId }: ProjectDrawerProps) {
  const router = useRouter();
  const { token, user } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [expandedProposals, setExpandedProposals] = useState<string[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isFreelancer = user?.role === "FREELANCER";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const data = await get<ProjectData>(`/projects/${projectId}`);
        setProject(data);

        if (user?.role === "CLIENT" && data.client?.id === user.id && token) {
          const props = await get<Proposal[]>(`/proposals/project/${projectId}`, token);
          setProposals(props);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectId, user, token]);

  const closeDrawer = () => {
    router.back();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmitProposal = async (data: { coverLetter: string; proposedBudget: number }) => {
    if (!project?.id || !token) return;
    try {
      await post(
        `/proposals/project/${project.id}`,
        { coverLetter: data.coverLetter, proposedBudget: data.proposedBudget },
        token
      );
      setSubmitted(true);
      setShowProposalForm(false);
    } catch (error) {
      console.error("Failed to submit proposal:", error);
      throw error;
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    if (!token) return;
    setAcceptingId(proposalId);
    try {
      const contract = await patch<{ id: string }>(`/proposals/${proposalId}/accept`, {}, token);
      if (contract?.id) {
        router.push(`/contracts/${contract.id}`);
      }
    } catch (error) {
      console.error("Failed to accept proposal:", error);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      closeDrawer();
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours || 1}h ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={handleClickOutside}
    >
      <div
        ref={drawerRef}
        className="w-full max-w-4xl bg-white text-slate-800 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-200"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin w-10 h-10" style={{ color: BRAND }} />
          </div>
        ) : !project ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Project not found</h2>
            <button onClick={closeDrawer} className="font-medium hover:underline" style={{ color: BRAND }}>
              Go back
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <button
                onClick={closeDrawer}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                style={{ color: BRAND }}
              >
                <ArrowLeft size={24} />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* Center Column */}
                <div className="md:col-span-8 space-y-8">
                  {showProposalForm && project ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="mb-6">
                        <button
                          onClick={() => setShowProposalForm(false)}
                          className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                          style={{ color: BRAND }}
                        >
                          <ArrowLeft size={14} /> Back to job details
                        </button>
                      </div>
                      <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                        <ProposalForm
                          projectTitle={project.title}
                          projectDescription={project.description}
                          projectSkills={project.skills}
                          budgetMin={project.budgetMin}
                          budgetMax={project.budgetMax}
                          token={token || undefined}
                          onSubmit={handleSubmitProposal}
                          onCancel={() => setShowProposalForm(false)}
                        />
                      </div>
                    </div>
                  ) : submitted ? (
                    <div className="border rounded-2xl p-8 text-center space-y-4 animate-in zoom-in-95 duration-300"
                      style={{ backgroundColor: "#f5f0ff", borderColor: "#d4bbff" }}
                    >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                        style={{ backgroundColor: "#ede9fe" }}
                      >
                        <CheckCircle size={32} style={{ color: BRAND }} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-800">Proposal Submitted!</h2>
                      <p className="text-slate-500 max-w-sm mx-auto">
                        Your proposal has been successfully sent to the client. They will review it and get back to you if they are interested.
                      </p>
                      <button
                        onClick={closeDrawer}
                        className="font-medium hover:underline"
                        style={{ color: BRAND }}
                      >
                        Return to job feed
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-4">
                          {project.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-400 border-b border-slate-200 pb-6">
                          <span>Posted {timeAgo(project.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {project.client?.profile?.country || "Worldwide"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-slate-800 mb-2">Summary</h2>
                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* AI Generated Sections (Questions & Criteria) */}
                      {(project.screeningQuestions?.length ?? 0) > 0 && (
                        <div className="pt-6 border-t border-slate-100 space-y-4">
                          <div className="flex items-center gap-2 text-indigo-900">
                            <HelpCircle size={18} className="text-indigo-600" />
                            <h3 className="font-semibold uppercase tracking-wider text-xs">Screening Questions</h3>
                          </div>
                          <div className="space-y-3">
                            {project.screeningQuestions?.map((q, i) => (
                              <div key={i} className="flex gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                                <span className="text-indigo-300 font-mono text-xs mt-0.5">0{i + 1}</span>
                                <p className="text-sm text-indigo-900 font-medium">{q}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(project.acceptanceCriteria?.length ?? 0) > 0 && (
                        <div className="pt-6 border-t border-slate-100 space-y-4">
                          <div className="flex items-center gap-2 text-slate-800">
                            <ListTodo size={18} className="text-slate-600" />
                            <h3 className="font-semibold uppercase tracking-wider text-xs">Acceptance Criteria</h3>
                          </div>
                          <div className="space-y-3">
                            {project.acceptanceCriteria?.map((c, i) => (
                              <div key={i} className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-700 font-medium">{c}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                        <div className="flex items-start gap-3">
                          <DollarSign className="text-slate-400 mt-1" size={20} />
                          <div>
                            <p className="font-semibold text-slate-800">
                              ${project.budgetMin} - ${project.budgetMax}
                            </p>
                            <p className="text-sm text-slate-400">Fixed-price</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="text-slate-400 mt-1" size={20} />
                          <div>
                            <p className="font-semibold text-slate-800">
                              {project.experienceLevel || "Intermediate"} level
                            </p>
                            <p className="text-sm text-slate-400">
                              I am looking for a mix of experience and value
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-3">Skills and Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.skills?.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-sm rounded-full border cursor-default transition-colors hover:opacity-80"
                              style={{
                                backgroundColor: "#f5f0ff",
                                color: BRAND,
                                borderColor: "#d4bbff",
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Client View: Proposals */}
                      {user?.role === "CLIENT" && project.client?.id === user.id && (
                        <div className="pt-8 border-t border-slate-200 mt-8">
                          <h3 className="text-xl font-bold text-slate-800 mb-6">
                            Proposals ({proposals.length})
                          </h3>
                          {proposals.length === 0 ? (
                            <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
                              <p className="text-slate-400">No proposals received yet.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {proposals.map((prop) => (
                                <div
                                  key={prop.id}
                                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                        style={{ backgroundColor: BRAND }}
                                      >
                                        {prop.freelancer?.profile?.name?.charAt(0) || "F"}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-800">
                                          {prop.freelancer?.profile?.name || "Freelancer"}
                                        </p>
                                        <p className="text-sm font-medium" style={{ color: BRAND }}>
                                          ${prop.proposedBudget || project.budgetMin}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      {prop.status === "PENDING" && (
                                        <button
                                          onClick={() => handleAcceptProposal(prop.id)}
                                          disabled={!!acceptingId}
                                          className="px-4 py-1.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                          style={{ backgroundColor: BRAND }}
                                        >
                                          {acceptingId === prop.id ? "Hiring..." : "Hire"}
                                        </button>
                                      )}
                                      <span
                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                          prop.status === "ACCEPTED"
                                            ? "text-white"
                                            : "bg-slate-200 text-slate-500"
                                        }`}
                                        style={
                                          prop.status === "ACCEPTED"
                                            ? { backgroundColor: BRAND }
                                            : {}
                                        }
                                      >
                                        {prop.status}
                                      </span>
                                    </div>
                                  </div>
                                  <p className={`text-sm text-slate-500 italic ${expandedProposals.includes(prop.id) ? "" : "line-clamp-3"}`}>
                                    "{prop.coverLetter}"
                                  </p>
                                  {prop.coverLetter.length > 200 && (
                                    <button
                                      onClick={() => setExpandedProposals(prev => 
                                        prev.includes(prop.id) ? prev.filter(id => id !== prop.id) : [...prev, prop.id]
                                      )}
                                      className="text-xs font-semibold mt-1 hover:underline"
                                      style={{ color: BRAND }}
                                    >
                                      {expandedProposals.includes(prop.id) ? "Read less" : "Read more"}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Right Column: Sidebar */}
                <div className="md:col-span-4 space-y-6">
                  {isFreelancer && !submitted && (
                    <div className="space-y-3">
                      {!showProposalForm && (
                        <button
                          onClick={() => setShowProposalForm(true)}
                          className="w-full text-white font-medium py-3 px-4 rounded-xl transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                          style={{ backgroundColor: BRAND }}
                        >
                          Apply now
                        </button>
                      )}
                      <button
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors pt-2"
                      >
                        <Flag size={14} /> Flag as inappropriate
                      </button>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">About the client</h3>
                    <div className="space-y-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        {project.client?.stripeCustomerId ? (
                          <CheckCircle size={16} style={{ color: BRAND }} />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                        <span>Payment method {project.client?.stripeCustomerId ? "verified" : "not verified"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.client?.profile?.kycStatus === "APPROVED" ? (
                          <CheckCircle size={16} style={{ color: BRAND }} />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                        <span>Identity {project.client?.profile?.kycStatus === "APPROVED" ? "verified" : "not verified"}</span>
                      </div>

                      {project.client?.rating !== undefined && project.client.reviewCount !== undefined && project.client.reviewCount > 0 && (
                        <div className="pt-2">
                          <div className="flex items-center gap-1 text-slate-700">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={14} 
                                className={`${star <= (project.client?.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} 
                              />
                            ))}
                            <span className="ml-1 font-semibold">{(project.client.rating || 0).toFixed(2)}</span>
                          </div>
                          <p className="text-slate-400 mt-0.5">{project.client.reviewCount} reviews</p>
                        </div>
                      )}

                      <div>
                        <p className="font-medium text-slate-800">
                          {project.client?.profile?.country || "Worldwide"}
                        </p>
                        <p className="text-slate-400">Client location</p>
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">
                          {project.client?.stats?.postedJobs || 0} jobs posted
                        </p>
                        <p className="text-slate-400">
                          {project.client?.stats?.hireRate || 0}% hire rate, {project.client?.stats?.openJobs || 0} open job
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-slate-400 text-xs">
                          Member since {project.client?.createdAt ? new Date(project.client.createdAt).getFullYear() : new Date().getFullYear()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Job link</p>
                    <div className="flex items-center bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <input
                        type="text"
                        readOnly
                        value={`http://localhost:3000/projects/${project.id}`}
                        className="bg-transparent border-none text-slate-400 text-sm w-full outline-none px-2 focus:ring-0"
                      />
                      <button
                        className="text-sm font-medium px-2 hover:underline whitespace-nowrap"
                        style={{ color: BRAND }}
                      >
                        Copy link
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}