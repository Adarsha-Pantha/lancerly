"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  DollarSign,
  Clock,
  MapPin,
  Users,
  Calendar,
  Briefcase,
  Star,
  CheckCircle,
  Award,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { get, post, patch } from "@/lib/api";
import ProjectChat from "@/components/contracts/ProjectChat";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  duration: string;
  location: string;
  remoteType: string;
  skills: string[];
  experienceLevel: string;
  requirements: string[];
  milestones: string[];
  clientName: string;
  clientRating: number;
  clientVerified: boolean;
  clientId: string;
  postedAt: string;
  status: string;
  proposals: number;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const { token, user } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposals, setProposals] = useState<Array<{
    id: string;
    coverLetter: string;
    proposedBudget?: number;
    status: string;
    createdAt: string;
    freelancer: { profile?: { name?: string; avatarUrl?: string } };
  }>>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [projectConversationId, setProjectConversationId] = useState<string | null>(null);
  const [contractFreelancer, setContractFreelancer] = useState<{ name?: string; avatarUrl?: string | null } | null>(null);

  const isClient = user?.role === "CLIENT";
  const isFreelancer = user?.role === "FREELANCER";
  const canSubmitProposal = isFreelancer && user?.id !== project?.clientId;

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && isClient && token) {
      fetchProposals();
    }
  }, [projectId, isClient, token]);

  useEffect(() => {
    if (projectId && token && user?.id && project?.status === "IN_PROGRESS") {
      fetchProjectChat();
    }
  }, [projectId, token, user?.id, project?.status]);

  async function fetchProjectChat() {
    if (!token || !projectId) return;
    try {
      const contract = await get<{
        id: string;
        clientId: string;
        freelancerId: string;
        freelancer?: { profile?: { name?: string; avatarUrl?: string | null } };
        client?: { profile?: { name?: string; avatarUrl?: string | null } };
      }>(`/contracts/project/${projectId}`, token);
      const isClientOnContract = contract?.clientId === user?.id;
      const otherParty = isClientOnContract ? contract?.freelancer : contract?.client;
      if (otherParty?.profile) {
        setContractFreelancer(otherParty.profile);
      } else if (otherParty) {
        setContractFreelancer({ name: isClientOnContract ? "Freelancer" : "Client" });
      }
      const convs = await get<Array<{ id: string }>>(`/conversations?projectId=${projectId}`, token);
      if (convs?.length) setProjectConversationId(convs[0].id);
    } catch {
      setProjectConversationId(null);
      setContractFreelancer(null);
    }
  }

  async function fetchProposals() {
    if (!token) return;
    try {
      const data = await get<typeof proposals>(`/proposals/project/${projectId}`, token);
      setProposals(Array.isArray(data) ? data : []);
    } catch {
      setProposals([]);
    }
  }

  const fetchProject = async () => {
    try {
      setLoading(true);
      const p = await get<{
        id?: string;
        title?: string;
        description?: string;
        projectType?: string;
        budgetMin?: number;
        budgetMax?: number;
        skills?: string[];
        requirements?: string[];
        milestones?: string[];
        clientId?: string;
        createdAt?: string;
        status?: string;
        client?: { id?: string; profile?: { name?: string; country?: string } };
        _count?: { proposals?: number };
      }>(`/projects/${projectId}`);
      setProject({
        id: p.id ?? "",
        title: p.title ?? "",
        description: p.description ?? "",
        category: p.projectType ?? "",
        budgetMin: p.budgetMin ?? 0,
        budgetMax: p.budgetMax ?? 0,
        duration: "",
        location: p.client?.profile?.country ?? "",
        remoteType: "",
        skills: Array.isArray(p.skills) ? p.skills : [],
        experienceLevel: "",
        requirements: Array.isArray(p.requirements) ? p.requirements : [],
        milestones: Array.isArray(p.milestones) ? p.milestones : [],
        clientName: p.client?.profile?.name ?? "Client",
        clientRating: 0,
        clientVerified: false,
        clientId: p.clientId ?? p.client?.id ?? "",
        postedAt: p.createdAt ?? new Date().toISOString(),
        status: p.status ?? "OPEN",
        proposals: p._count?.proposals ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (data: { coverLetter: string; proposedBudget: number }) => {
    if (!project?.id || !token) return;
    await post(
      `/proposals/project/${project.id}`,
      { coverLetter: data.coverLetter, proposedBudget: data.proposedBudget },
      token
    );
    setShowProposalForm(false);
    await fetchProject();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-blue mb-2">Project Not Found</h2>
          <p className="text-slate-blue/70 mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-xl hover:bg-[#A78BFA] transition-colors font-medium"
          >
            Browse Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Projects
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-blue mb-2">{project.title}</h1>
              <p className="text-slate-blue/70 mb-4">{project.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  {project.experienceLevel}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {project.category}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                  {project.remoteType}
                </span>
              </div>
            </div>

            {canSubmitProposal && !showProposalForm && (
              <Button onClick={() => setShowProposalForm(true)}>
                <Send size={18} />
                Submit Proposal
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-semibold text-slate-blue mb-6">Project Details</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-emerald-500" size={20} />
                  <div>
                    <p className="text-sm text-slate-500">Budget Range</p>
                    <p className="font-semibold text-slate-blue">${project.budgetMin} - ${project.budgetMax}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-500" size={20} />
                  <div>
                    <p className="text-sm text-slate-500">Duration</p>
                    <p className="font-semibold text-slate-blue">{project.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="text-purple-500" size={20} />
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-semibold text-slate-blue">{project.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="text-orange-500" size={20} />
                  <div>
                    <p className="text-sm text-slate-500">Proposals</p>
                    <p className="font-semibold text-slate-blue">{project.proposals}</p>
                  </div>
                </div>
              </div>

              {/* Skills Required */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-blue mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {(project.skills ?? []).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {(project.requirements ?? []).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-blue mb-3">Requirements</h3>
                  <div className="space-y-2">
                    {(project.requirements ?? []).map((requirement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                        <span className="text-slate-blue">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {(project.milestones ?? []).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-blue mb-3">Project Milestones</h3>
                  <div className="space-y-2">
                    {(project.milestones ?? []).map((milestone, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Calendar className="text-blue-500 mt-0.5" size={16} />
                        <span className="text-slate-blue">Milestone {index + 1}: {milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project Chat (when project has active contract - client or freelancer) */}
            {projectConversationId && token && user?.id && (
              <ProjectChat
                conversationId={projectConversationId}
                token={token}
                currentUserId={user.id}
                otherPartyName={contractFreelancer?.name ?? "Freelancer"}
                otherPartyAvatar={contractFreelancer?.avatarUrl}
                defaultExpanded={true}
              />
            )}

            {/* Client: Proposals to review */}
            {isClient && project.clientId === user?.id && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-semibold text-slate-blue mb-6">Proposals ({proposals.length})</h2>
                {proposals.length === 0 ? (
                  <p className="text-slate-600">No proposals yet. Freelancers will see your project when they browse.</p>
                ) : (
                  <div className="space-y-6">
                    {proposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                              {(prop.freelancer?.profile?.name ?? "F").charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-blue">{prop.freelancer?.profile?.name ?? "Freelancer"}</p>
                              {prop.proposedBudget != null && (
                                <p className="text-sm text-slate-600 font-medium">${prop.proposedBudget.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              prop.status === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : prop.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap mb-4 line-clamp-4">{prop.coverLetter}</p>
                        {prop.status === "PENDING" && (
                          <div className="flex gap-3">
                            <button
                              onClick={async () => {
                                if (!token) return;
                                setAcceptingId(prop.id);
                                try {
                                  const contract = await patch<{ id: string }>(`/proposals/${prop.id}/accept`, undefined, token);
                                  await fetchProject();
                                  await fetchProposals();
                                  if (contract?.id) router.push(`/contracts/${contract.id}`);
                                } catch (e) {
                                  alert((e as Error)?.message || "Failed to accept");
                                } finally {
                                  setAcceptingId(null);
                                }
                              }}
                              disabled={!!acceptingId}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70 font-medium text-sm"
                            >
                              {acceptingId === prop.id ? "Accepting…" : "Accept"}
                            </button>
                            <button
                              onClick={async () => {
                                if (!token) return;
                                setRejectingId(prop.id);
                                try {
                                  await patch(`/proposals/${prop.id}/reject`, undefined, token);
                                  await fetchProposals();
                                } catch (e) {
                                  alert((e as Error)?.message || "Failed to reject");
                                } finally {
                                  setRejectingId(null);
                                }
                              }}
                              disabled={!!rejectingId}
                              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-70 font-medium text-sm"
                            >
                              {rejectingId === prop.id ? "Rejecting…" : "Reject"}
                            </button>
                          </div>
                        )}
                        {prop.status === "ACCEPTED" && (
                          <Link
                            href={`/contracts/project/${projectId}`}
                            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            View Contract & Workspace
                            <ArrowRight size={16} />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Proposal Form */}
            {showProposalForm && canSubmitProposal && project && (
              <ProposalForm
                projectTitle={project.title}
                projectDescription={project.description}
                budgetMin={project.budgetMin}
                budgetMax={project.budgetMax}
                onSubmit={handleSubmitProposal}
                onCancel={() => setShowProposalForm(false)}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-blue mb-4">About the Client</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(project.clientName ?? "C").charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-blue">{project.clientName ?? "Client"}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className="text-sm text-slate-blue ml-1">{(project.clientRating ?? 0).toFixed(1)}</span>
                    </div>
                    {project.clientVerified && (
                      <CheckCircle size={14} className="text-emerald-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-blue">
                  <Award size={16} />
                  <span>Member since {new Date(project.postedAt ?? Date.now()).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-blue">
                  <Briefcase size={16} />
                  <span>{project.proposals ?? 0} projects posted</span>
                </div>
              </div>

              {isClient && project.clientId === user?.id && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="w-full px-4 py-2 border border-slate-200 text-slate-blue rounded-lg hover:bg-slate-50 transition-colors text-center font-medium"
                  >
                    Edit Project
                  </Link>
                </div>
              )}
            </div>

            {/* Project Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-blue mb-4">Project Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Posted</span>
                  <span className="text-sm font-medium text-slate-blue">
                    {new Date(project.postedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    {project.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Views</span>
                  <span className="text-sm font-medium text-slate-blue">127</span>
                </div>
              </div>
            </div>

            {/* Similar Projects */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-blue mb-4">Similar Projects</h3>
              
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Link key={i} href="#" className="block p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <h4 className="font-medium text-slate-blue text-sm mb-1">Similar Project {i}</h4>
                    <p className="text-xs text-slate-500">$500 - $1000 • 2 weeks</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
