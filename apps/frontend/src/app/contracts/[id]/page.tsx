"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, post, patch } from "@/lib/api";
import { Loader2, Plus, Clock, DollarSign, FileText, ArrowRight, AlertTriangle, CheckCircle2, FileCheck } from "lucide-react";
import ProjectChat from "@/components/contracts/ProjectChat";
import { MilestoneCard } from "@/components/contracts/MilestoneCard";
import { EscrowStatus } from "@/components/contracts/EscrowStatus";
import { WorkspaceLayout } from "@/components/contracts/WorkspaceLayout";
import type { WorkspaceTab } from "@/components/contracts/WorkspaceTabs";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { KYCVerifiedBadge, DoubleBlindReviewCard } from "@/components/ui/TrustBadges";
import { Button } from "@/components/ui/button";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type Contract = {
  id: string;
  agreedBudget: number;
  status: string;
  startDate: string;
  endDate?: string;
  terms?: string;
  clientAcceptedAt?: string;
  freelancerAcceptedAt?: string;
  terminationReason?: string;
  terminatedAt?: string;
  project: {
    id: string;
    title: string;
    description: string;
  };
  freelancer: {
    profile: {
      name: string;
      avatarUrl?: string;
      stripeAccountId?: string | null;
    };
  };
  client: {
    profile: {
      name: string;
      avatarUrl?: string;
    };
  };
  milestones: Milestone[];
  _count: {
    deliveries: number;
    timeEntries: number;
  };
};

type Milestone = {
  id: string;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  status: string;
  createdAt: string;
  stripePaymentIntentId?: string | null;
  isFunded?: boolean;
};

export default function ContractPage() {
  const router = useRouter();
  const params = useParams();
  const { token, user } = useAuth();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");
  const [fundingMilestone, setFundingMilestone] = useState<{ id: string; amount: number } | null>(null);
  const [fundClientSecret, setFundClientSecret] = useState<string | null>(null);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [terminating, setTerminating] = useState(false);
  const [terminateReason, setTerminateReason] = useState("");
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [projectConversationId, setProjectConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [platformSettings, setPlatformSettings] = useState<{ freelancerServiceFee: number; clientProcessingFee: number } | null>(null);

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    // Fetch platform fees
    get<{ freelancerServiceFee: number; clientProcessingFee: number }>("/admin/settings/platform", token)
      .then(setPlatformSettings)
      .catch(() => setPlatformSettings({ freelancerServiceFee: 10, clientProcessingFee: 3 })); // Fallback
    
    // Handle Stripe redirect after 3DS
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (params.get("redirect_status") === "succeeded") {
      router.replace(`/contracts/${contractId}`);
      void loadContract();
      return;
    }
    void loadContract();
  }, [token, user, contractId]);

  async function loadContract() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await get<Contract>(`/contracts/${contractId}`, token);
      setContract(data);
      
      // Auto-sync milestones that have an intent but aren't marked funded yet
      if (data?.milestones) {
        for (const m of data.milestones) {
          if (m.stripePaymentIntentId && !m.isFunded && m.status !== "PAID") {
            try {
              await post(`/stripe/milestones/${m.id}/sync`, {}, token);
            } catch (e) {
              console.error("Failed to sync milestone", m.id, e);
            }
          }
        }
        // If we synced anything, reload once
        if (data.milestones.some(m => m.stripePaymentIntentId && !m.isFunded)) {
          const syncedData = await get<Contract>(`/contracts/${contractId}`, token);
          setContract(syncedData);
        }
      }

      const pid = data?.project && "id" in data.project ? (data.project as { id: string }).id : null;
      if (pid) {
        const convs = await get<Array<{ id: string }>>(`/conversations?projectId=${pid}`, token);
        if (convs?.length) setProjectConversationId(convs[0].id);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load contract");
    } finally {
      setLoading(false);
    }
  }

  async function createMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !contract) return;

    try {
      await post(
        `/contracts/${contract.id}/milestones`,
        {
          title: milestoneTitle,
          description: milestoneDescription || undefined,
          amount: Math.round(parseFloat(milestoneAmount) * 100),
          dueDate: milestoneDueDate || undefined,
        },
        token
      );
      setShowMilestoneForm(false);
      setMilestoneTitle("");
      setMilestoneDescription("");
      setMilestoneAmount("");
      setMilestoneDueDate("");
      await loadContract();
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to create milestone");
    }
  }

  function startFundMilestone(milestone: Milestone) {
    router.push(`/settings/payments/${milestone.id}`);
  }

  function closeFundModal() {
    setFundingMilestone(null);
    setFundClientSecret(null);
    setFundingError(null);
  }

  async function approveMilestone(milestoneId: string) {
    if (!token) return;
    if (!confirm("Approve this milestone?")) return;

    try {
      await patch(`/contracts/milestones/${milestoneId}/approve`, undefined, token);
      await loadContract();
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "";
      if (msg.includes("not funded") || msg.includes("requires_payment_method")) {
        if (confirm("This milestone hasn't been fully funded yet. Would you like to complete the payment now?")) {
          router.push(`/settings/payments/${milestoneId}`);
        }
      } else {
        alert(msg || "Failed to approve milestone");
      }
    }
  }

  async function terminateContract() {
    if (!token || !contract) return;
    setTerminating(true);
    try {
      await patch(`/contracts/${contract.id}/terminate`, { reason: terminateReason || undefined }, token);
      setShowTerminateModal(false);
      setTerminateReason("");
      await loadContract();
      router.push("/contracts/me");
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to terminate contract");
    } finally {
      setTerminating(false);
    }
  }

  async function completeMilestone(milestoneId: string) {
    if (!token) return;
    if (!confirm("Mark this milestone as complete? The client will review your work.")) return;
    try {
      await patch(`/contracts/milestones/${milestoneId}/complete`, undefined, token);
      await loadContract();
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to mark complete");
    }
  }

  async function completeContract() {
    if (!token || !contract) return;
    if (!confirm("Mark this contract as completed? This will close the project.")) return;
    try {
      await patch(`/contracts/${contract.id}/complete`, undefined, token);
      await loadContract();
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to complete contract");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "We couldn&apos;t find this contract."}</p>
          <Button
            onClick={() => router.push(user?.role === "CLIENT" ? "/projects/mine" : "/contracts/me")}
            variant="default"
          >
            Back to {user?.role === "CLIENT" ? "Projects" : "Contracts"}
          </Button>
        </div>
      </div>
    );
  }

  const isClient = user?.role === "CLIENT";

  const escrowStage =
    contract.milestones.some((m) => m.status === "PAID")
      ? "freelancer"
      : contract.milestones.some((m) => m.stripePaymentIntentId && m.status !== "PAID")
        ? "escrow"
        : "client";
  const fundedCount = contract.milestones.filter((m) => m.status !== "PENDING" || m.stripePaymentIntentId).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/contracts/me")}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            ← Back to Contracts
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{contract.project.title}</h1>
            <KYCVerifiedBadge />
          </div>
          <p className="text-muted-foreground mb-6">{contract.project.description}</p>
          
          {!isClient && !contract.freelancer.profile.stripeAccountId && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-amber-900">Connect Stripe to receive payments</h4>
                <p className="text-sm text-amber-700 mt-1 mb-3">
                  You need to connect your Stripe account before the client can fund milestones or release payments.
                </p>
                <Button size="sm" onClick={() => router.push("/settings")}>
                  Go to Settings
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          <WorkspaceLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <EscrowStatus
                    stage={escrowStage}
                    amount={contract.agreedBudget}
                    fundedCount={fundedCount}
                    totalMilestones={contract.milestones.length}
                  />
                  {/* Next Step / Active Milestone */}
                  {(contract.status === "ACTIVE") && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm border-dashed">
                      <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                        <ArrowRight size={18} />
                        Next Step
                      </h3>
                      {(() => {
                        const nextMilestone = contract.milestones.find(m => m.status !== "PAID");
                        if (!nextMilestone) return <p className="text-sm text-muted-foreground">All milestones are completed and paid!</p>;
                        
                        return (
                          <div className="space-y-4">
                            <div>
                              <p className="font-medium text-foreground">{nextMilestone.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{nextMilestone.description || "Active milestone"}</p>
                            </div>
                            <MilestoneCard
                              milestone={nextMilestone} 
                              isClient={isClient}
                              onApprove={() => approveMilestone(nextMilestone.id)}
                              onFund={() => startFundMilestone(nextMilestone)}
                              onComplete={() => completeMilestone(nextMilestone.id)}
                              platformSettings={platformSettings}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {!isClient && contract.status === "ACTIVE" && contract.milestones.length === 0 && (
                     <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col items-center text-center">
                        <Clock className="text-amber-500 mb-2" size={32} />
                        <h3 className="font-semibold">Awaiting Milestones</h3>
                        <p className="text-sm text-muted-foreground">The client needs to add milestones before you can start tracking progress and earnings.</p>
                     </div>
                  )}
                  {isClient && contract.status === "ACTIVE" && contract.milestones.length === 0 && (
                     <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col items-center text-center">
                        <Plus className="text-primary mb-2" size={32} />
                        <h3 className="font-semibold">Add Your First Milestone</h3>
                        <p className="text-sm text-muted-foreground mb-4">Break the work into clear steps and fund them to start the project.</p>
                        <Button size="sm" onClick={() => setActiveTab("milestones")}>Go to Milestones</Button>
                     </div>
                  )}
                  <DoubleBlindReviewCard />
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <DollarSign size={16} />
                    <span className="font-medium text-foreground">${contract.agreedBudget.toLocaleString()} budget</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <FileText size={16} />
                    {contract._count.deliveries} delivery{contract._count.deliveries === 1 ? "" : "s"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {contract._count.timeEntries} time entr{contract._count.timeEntries === 1 ? "y" : "ies"}
                  </span>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileCheck size={20} />
                    Contract agreement
                  </h2>
                  {contract.terms ? (
                    <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{contract.terms}</p>
                  ) : (
                    <p className="text-muted-foreground mb-4 italic">
                      Terms based on the accepted proposal. Both parties agreed when the contract was created.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {contract.clientAcceptedAt && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 size={16} className="text-[#059669]" />
                        <span>Client accepted {new Date(contract.clientAcceptedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {contract.freelancerAcceptedAt && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 size={16} className="text-[#059669]" />
                        <span>Freelancer accepted {new Date(contract.freelancerAcceptedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {contract.terminationReason && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={16} />
                        <span>Terminated: {contract.terminationReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {contract.status === "ACTIVE" && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowTerminateModal(true)}
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    >
                      <AlertTriangle size={16} className="mr-2" />
                      Terminate contract
                    </Button>
                    {isClient &&
                      contract.milestones.length > 0 &&
                      contract.milestones.every((m) => m.status === "PAID") && (
                        <Button onClick={completeContract} className="bg-[#059669] hover:bg-[#047857]">
                          <CheckCircle2 size={16} className="mr-2" />
                          Mark as completed
                        </Button>
                      )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "milestones" && isClient && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Milestones</h2>
                  <Button onClick={() => setShowMilestoneForm(!showMilestoneForm)}>
                    <Plus size={18} className="mr-2" />
                    Add milestone
                  </Button>
                </div>

                {showMilestoneForm && (
                  <form onSubmit={createMilestone} className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <h3 className="text-sm font-medium text-foreground mb-4">New milestone</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                        <input
                          type="text"
                          value={milestoneTitle}
                          onChange={(e) => setMilestoneTitle(e.target.value)}
                          required
                          placeholder="e.g. Design mockups"
                          className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
                        <textarea
                          value={milestoneDescription}
                          onChange={(e) => setMilestoneDescription(e.target.value)}
                          placeholder="What should be delivered?"
                          className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Amount ($)</label>
                          <input
                            type="number"
                            value={milestoneAmount}
                            onChange={(e) => setMilestoneAmount(e.target.value)}
                            required
                            min="0"
                            placeholder="0"
                            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Due date</label>
                          <input
                            type="date"
                            value={milestoneDueDate}
                            onChange={(e) => setMilestoneDueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button type="submit">Create milestone</Button>
                        <Button type="button" variant="outline" onClick={() => setShowMilestoneForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {contract.milestones.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white/50 p-12 text-center">
                      <p className="text-muted-foreground font-medium">No milestones yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add your first milestone to break the work into clear, payable steps.
                      </p>
                      {!showMilestoneForm && (
                        <Button className="mt-4" onClick={() => setShowMilestoneForm(true)}>
                          <Plus size={18} className="mr-2" />
                          Add milestone
                        </Button>
                      )}
                    </div>
                  ) : (
                    contract.milestones.map((milestone) => (
                      <MilestoneCard
                        key={milestone.id}
                        milestone={milestone}
                        isClient={isClient}
                        onApprove={() => approveMilestone(milestone.id)}
                        onFund={() => startFundMilestone(milestone)}
                        funding={fundingMilestone?.id === milestone.id}
                        platformSettings={platformSettings}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

        {/* Terminate Contract modal */}
        {showTerminateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2 text-red-700">
                <AlertTriangle size={20} />
                Terminate contract
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                This will end the contract and cancel the project. The other party will be notified. Any unfunded milestones will be cancelled.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
                <textarea
                  value={terminateReason}
                  onChange={(e) => setTerminateReason(e.target.value)}
                  placeholder="e.g. Project scope changed, mutual agreement..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={terminateContract}
                  disabled={terminating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70"
                >
                  {terminating ? "Ending contract…" : "End contract"}
                </button>
                <button
                  onClick={() => {
                    setShowTerminateModal(false);
                    setTerminateReason("");
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fund Milestone modal */}
        {fundingMilestone && stripePromise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Secure payment</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Amount: ${fundingMilestone.amount.toLocaleString()} — funds go to escrow until work is approved.
              </p>
              {fundClientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret: fundClientSecret, appearance: { theme: "stripe" } }}>
                  <FundMilestoneForm
                    onSuccess={() => {
                      closeFundModal();
                      loadContract();
                    }}
                    onCancel={closeFundModal}
                  />
                </Elements>
              ) : fundingError ? (
                <div className="space-y-4">
                  <p className="text-red-600">{fundingError}</p>
                  <button onClick={closeFundModal} className="px-4 py-2 border rounded-lg">Close</button>
                </div>
              ) : (
                <Loader2 className="animate-spin text-purple-600" size={32} />
              )}
            </div>
          </div>
        )}

            {activeTab === "milestones" && !isClient && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {contract.milestones.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white/50 p-12 text-center">
                      <p className="text-muted-foreground font-medium">No milestones yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        The client will add milestones. You&apos;ll be able to deliver and mark them complete here.
                      </p>
                    </div>
                  ) : (
                    contract.milestones.map((milestone) => (
                      <MilestoneCard
                        key={milestone.id}
                        milestone={milestone}
                        isClient={false}
                        onComplete={
                          (milestone.status === "PENDING" || milestone.status === "IN_PROGRESS")
                            ? () => completeMilestone(milestone.id)
                            : undefined
                        }
                      />
                    ))
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    type="button"
                    onClick={() => router.push(`/contracts/${contractId}/deliveries`)}
                    className="rounded-xl border border-[#E2E8F0] bg-white p-6 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Deliveries</h3>
                      <FileText className="text-primary" size={24} />
                    </div>
                    <p className="text-muted-foreground mb-4">Submit and manage your project deliverables</p>
                    <span className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                      View deliveries
                      <ArrowRight size={18} />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push(`/contracts/${contractId}/time`)}
                    className="rounded-xl border border-[#E2E8F0] bg-white p-6 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Time tracking</h3>
                      <Clock className="text-primary" size={24} />
                    </div>
                    <p className="text-muted-foreground mb-4">Track time spent on this project</p>
                    <span className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                      Track time
                      <ArrowRight size={18} />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "chat" && projectConversationId && token && user?.id && (
              <ProjectChat
                conversationId={projectConversationId}
                token={token}
                currentUserId={user.id}
                otherPartyName={isClient ? contract.freelancer?.profile?.name ?? "Freelancer" : contract.client?.profile?.name ?? "Client"}
                otherPartyAvatar={isClient ? contract.freelancer?.profile?.avatarUrl : contract.client?.profile?.avatarUrl}
                defaultExpanded={true}
              />
            )}

            {activeTab === "chat" && !projectConversationId && (
              <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white/50 p-12 text-center">
                <p className="text-muted-foreground font-medium">Messages unavailable</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Chat will be available once the project conversation is set up.
                </p>
              </div>
            )}
          </WorkspaceLayout>
        </div>
      </div>
    </div>
  );
}

function FundMilestoneForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "/contracts",
        },
      });
      if (submitError) {
        setError(submitError.message || "Payment failed");
      } else {
        onSuccess();
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-70"
        >
          {loading ? "Processing…" : "Pay securely"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  );
}
