"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { needsCompletion } from "@/lib/auth";
import { get } from "@/lib/api";
import {
  MapPin,
  Phone,
  Calendar,
  UserCircle2,
  Home,
  Building2,
  Hash,
  ShieldCheck,
  Sparkles,
  Pencil,
  Edit,
  Award,
  TrendingUp,
  Mail,
  Globe,
  Briefcase,
  Star,
  Clock,
  CheckCircle2,
  Settings,
  Plus,
  BarChart3,
  DollarSign,
  Users,
  FileText,
  Link as LinkIcon,
  Bell,
  Eye,
  MessageSquare,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Zap,
  Target,
  TrendingDown,
} from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";

type Field = string | null | undefined;

function calcCompletion(...fields: Field[]) {
  const filled = fields.filter((v) => !!v && String(v).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

type ProfileData = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    name?: string | null;
    headline?: string | null;
    skills?: any;
    avatarUrl?: string | null;
    dob?: string | null;
    country?: string | null;
    phone?: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    isComplete?: boolean | null;
  } | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "activity">("overview");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
        // Fetch full profile data with headline and skills
        if (token) {
          try {
            const data = await get<ProfileData>("/profile/me", token);
            setProfileData(data);
          } catch {
            // Profile endpoint might not be available, continue without it
          }
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, [refreshUser, token]);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!hydrated) return;
    if (token && needsCompletion(user)) {
      router.replace("/profile/setup");
    }
  }, [hydrated, token, user, router]);

  const completion = useMemo(
    () =>
      calcCompletion(
        user?.name,
        user?.country,
        user?.phone,
        user?.street,
        user?.city,
        user?.state,
        user?.postalCode
      ),
    [user]
  );

  if (!token) return null;
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-300 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  const name = user?.name || "";
  const role = user?.role || "FREELANCER";
  const email = user?.email || "";

  const roleConfig = {
    CLIENT: {
      label: "Client",
      icon: <Briefcase className="text-slate-700 dark:text-slate-300" size={18} />,
      color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    },
    FREELANCER: {
      label: "Freelancer",
      icon: <Star className="text-slate-700 dark:text-slate-300" size={18} />,
      color: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    },
    ADMIN: {
      label: "Admin",
      icon: <ShieldCheck className="text-slate-700 dark:text-slate-300" size={18} />,
      color: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.FREELANCER;

  const stats = [
    {
      label: "Active Projects",
      value: "12",
      change: "+2",
      changeType: "positive" as const,
      icon: <Briefcase className="text-blue-600 dark:text-blue-400" size={20} />,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Total Earnings",
      value: "$24.5K",
      change: "+12%",
      changeType: "positive" as const,
      icon: <DollarSign className="text-green-600 dark:text-green-400" size={20} />,
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      label: "Profile Views",
      value: "1.2K",
      change: "+18%",
      changeType: "positive" as const,
      icon: <Eye className="text-purple-600 dark:text-purple-400" size={20} />,
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      label: "Client Rating",
      value: "4.9",
      change: "0.2",
      changeType: "positive" as const,
      icon: <Star className="text-yellow-600 dark:text-yellow-400" size={20} />,
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    {
      label: "Response Time",
      value: "1h 45m",
      change: "-15m",
      changeType: "positive" as const,
      icon: <Clock className="text-indigo-600 dark:text-indigo-400" size={20} />,
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
    },
    {
      label: "Completed Jobs",
      value: "48",
      change: "+5",
      changeType: "positive" as const,
      icon: <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
  ];

  const activityFeed = [
    {
      title: "Proposal sent to Beacon Labs",
      time: "2h ago",
      meta: "Brand identity refresh",
      type: "proposal",
    },
    {
      title: "Payment released by Orbit Studio",
      time: "Yesterday",
      meta: "Phase 2 milestone cleared - $2,500",
      type: "payment",
    },
    {
      title: "New invite from Pixel North",
      time: "2 days ago",
      meta: "Landing page redesign",
      type: "invite",
    },
    {
      title: "Project completed: E-commerce Platform",
      time: "3 days ago",
      meta: "Delivered successfully",
      type: "completion",
    },
  ];

  const recentProjects = [
    {
      title: "E-commerce Platform Redesign",
      client: "TechCorp Inc.",
      status: "In Progress",
      progress: 65,
      deadline: "Mar 15, 2024",
    },
    {
      title: "Mobile App UI/UX",
      client: "StartupXYZ",
      status: "Review",
      progress: 90,
      deadline: "Mar 10, 2024",
    },
    {
      title: "Brand Identity Package",
      client: "Creative Agency",
      status: "Completed",
      progress: 100,
      deadline: "Feb 28, 2024",
    },
  ];

  const certifications = [
    { name: "UI/UX Design Certification", issuer: "Google", year: "2023" },
    { name: "Frontend Development", issuer: "Meta", year: "2022" },
    { name: "Project Management", issuer: "PMI", year: "2021" },
  ];

  const socialLinks = [
    { platform: "LinkedIn", url: "#", icon: <LinkIcon size={16} /> },
    { platform: "GitHub", url: "#", icon: <LinkIcon size={16} /> },
    { platform: "Portfolio", url: "#", icon: <ExternalLink size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 dark:from-slate-900 dark:via-blue-950/10 dark:to-purple-950/10">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${config.color}`}>
                  {config.icon}
                  <span className="font-semibold text-sm">{config.label}</span>
                </div>
                {completion === 100 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-semibold">Verified</span>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <AnimatedThemeToggler />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">{name || "Your Name"}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span className="text-sm">{email}</span>
                </div>
                {user?.country && (
                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    <span className="text-sm">{user.country}</span>
                  </div>
                )}
                {user?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="text-sm">{user.city}</span>
                  </div>
                )}
              </div>
              
              {/* Profile Completion */}
              <div className="max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Completion</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{completion}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                    style={{ width: `${completion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <AnimatedButton
                variant="primary"
                size="md"
                icon={<Edit size={16} />}
                onClick={() => router.push("/profile/edit")}
                className="w-full md:w-auto"
              >
                Edit Profile
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                size="md"
                icon={<Settings size={16} />}
                onClick={() => router.push("/settings")}
                className="w-full md:w-auto"
              >
                Settings
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: "overview", label: "Overview", icon: <BarChart3 size={18} /> },
            { id: "details", label: "Details", icon: <UserCircle2 size={18} /> },
            { id: "activity", label: "Activity", icon: <Clock size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? "text-slate-900 dark:text-slate-100 border-slate-900 dark:border-slate-100"
                  : "text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.map((stat, idx) => (
                    <StatBox
                      key={idx}
                      icon={stat.icon}
                      value={stat.value}
                      label={stat.label}
                      change={stat.change}
                      changeType={stat.changeType}
                      bgColor={stat.bgColor}
                      borderColor={stat.borderColor}
                    />
                  ))}
                </div>

                {/* About Section */}
                <div className="bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <UserCircle2 className="text-purple-600 dark:text-purple-400" size={20} />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">About</h2>
                    </div>
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      icon={<Pencil size={14} />}
                      onClick={() => router.push("/profile/edit")}
                    >
                      Edit
                    </AnimatedButton>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {profileData?.profile?.headline || "Add a headline to showcase your expertise and attract clients. This helps people understand what you do and why they should work with you."}
                  </p>
                  {!profileData?.profile?.headline && (
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={() => router.push("/profile/edit")}
                      className="mt-4"
                    >
                      Add Headline
                    </AnimatedButton>
                  )}
                </div>

                {/* Skills Section */}
                <div className="bg-gradient-to-br from-white to-pink-50/30 dark:from-slate-800 dark:to-pink-950/20 rounded-lg border border-pink-200/50 dark:border-pink-800/50 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <Sparkles className="text-pink-600 dark:text-pink-400" size={20} />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Skills & Expertise</h2>
                    </div>
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      icon={<Pencil size={14} />}
                      onClick={() => router.push("/profile/edit")}
                    >
                      Edit
                    </AnimatedButton>
                  </div>
                  {profileData?.profile?.skills && Array.isArray(profileData.profile.skills) && profileData.profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.profile.skills.map((skill: string, idx: number) => {
                        const colors = [
                          "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                          "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
                          "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
                          "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
                          "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
                        ];
                        return (
                          <span
                            key={idx}
                            className={`px-3 py-1.5 rounded-md font-medium text-sm border ${colors[idx % colors.length]}`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">No skills added yet</p>
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        icon={<Plus size={14} />}
                        onClick={() => router.push("/profile/edit")}
                      >
                        Add Skills
                      </AnimatedButton>
                    </div>
                  )}
                </div>

                {/* Recent Projects */}
                <div className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Briefcase className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent Projects</h2>
                    </div>
                    <Link href="/projects/mine" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                      View All
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {recentProjects.map((project, idx) => (
                      <div key={idx} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{project.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{project.client}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            project.status === "Completed" 
                              ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                              : project.status === "In Progress"
                              ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                              : "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{project.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                project.progress === 100 
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                  : project.progress >= 75
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                  : "bg-gradient-to-r from-yellow-500 to-orange-500"
                              }`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Deadline: {project.deadline}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-800 dark:to-yellow-950/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Award className="text-yellow-600 dark:text-yellow-400" size={20} />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Certifications</h2>
                    </div>
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={() => router.push("/profile/edit")}
                    >
                      Add
                    </AnimatedButton>
                  </div>
                  <div className="space-y-3">
                    {certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-start justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">{cert.name}</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{cert.issuer} • {cert.year}</p>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "details" && (
              <div className="space-y-6">
                <DetailSection
                  title="Personal Information"
                  icon={<UserCircle2 className="text-blue-600 dark:text-blue-400" size={20} />}
                  bgColor="from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-950/20"
                  borderColor="border-blue-200/50 dark:border-blue-800/50"
                  items={[
                    { icon: <Mail size={18} />, label: "Email", value: email },
                    { icon: <Phone size={18} />, label: "Phone", value: user?.phone || "Not provided" },
                    { icon: <Calendar size={18} />, label: "Date of Birth", value: user?.dob ? new Date(user.dob).toLocaleDateString() : "Not provided" },
                  ]}
                />
                <DetailSection
                  title="Location"
                  icon={<MapPin className="text-green-600 dark:text-green-400" size={20} />}
                  bgColor="from-white to-green-50/30 dark:from-slate-800 dark:to-green-950/20"
                  borderColor="border-green-200/50 dark:border-green-800/50"
                  items={[
                    { icon: <Globe size={18} />, label: "Country", value: user?.country || "Not provided" },
                    { icon: <Building2 size={18} />, label: "City", value: user?.city || "Not provided" },
                    { icon: <Building2 size={18} />, label: "State/Province", value: user?.state || "Not provided" },
                    { icon: <Home size={18} />, label: "Street", value: user?.street || "Not provided" },
                    { icon: <Hash size={18} />, label: "Postal Code", value: user?.postalCode || "Not provided" },
                  ]}
                />
              </div>
            )}

            {activeTab === "activity" && (
              <div className="bg-gradient-to-br from-white to-cyan-50/30 dark:from-slate-800 dark:to-cyan-950/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Clock className="text-cyan-600 dark:text-cyan-400" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h2>
                </div>
                <div className="space-y-4">
                  {activityFeed.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.type === "payment" ? "bg-green-100 dark:bg-green-950/30" :
                        activity.type === "proposal" ? "bg-blue-100 dark:bg-blue-950/30" :
                        activity.type === "invite" ? "bg-purple-100 dark:bg-purple-950/30" :
                        "bg-slate-100 dark:bg-slate-700"
                      }`}>
                        {activity.type === "payment" ? <DollarSign size={16} className="text-green-700 dark:text-green-400" /> :
                         activity.type === "proposal" ? <FileText size={16} className="text-blue-700 dark:text-blue-400" /> :
                         activity.type === "invite" ? <Bell size={16} className="text-purple-700 dark:text-purple-400" /> :
                         <CheckCircle2 size={16} className="text-slate-700 dark:text-slate-400" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-1">{activity.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{activity.meta}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/projects/new"
                  className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors group"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Plus className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Create Project</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Post a new project</p>
                  </div>
                </Link>
                <Link
                  href="/feed"
                  className="flex items-center gap-3 p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors group"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <Sparkles className="text-purple-600 dark:text-purple-400" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">View Feed</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">See community posts</p>
                  </div>
                </Link>
                <Link
                  href="/projects/mine"
                  className="flex items-center gap-3 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition-colors group"
                >
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <Briefcase className="text-indigo-600 dark:text-indigo-400" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">My Projects</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Manage projects</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-br from-white to-violet-50/30 dark:from-slate-800 dark:to-violet-950/20 rounded-lg border border-violet-200/50 dark:border-violet-800/50 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Social Links</h3>
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => router.push("/profile/edit")}
                >
                  Add
                </AnimatedButton>
              </div>
              <div className="space-y-2">
                {socialLinks.map((link, idx) => {
                  const colors = [
                    "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40",
                    "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50",
                    "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40",
                  ];
                  return (
                    <a
                      key={idx}
                      href={link.url}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${colors[idx] || colors[0]}`}
                    >
                      <div className={`p-1.5 rounded ${
                        idx === 0 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                        idx === 1 ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400" :
                        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      }`}>
                        {link.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{link.platform}</span>
                      <ExternalLink size={14} className="ml-auto text-slate-400" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Profile Completion */}
            {completion < 100 && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Award className="text-orange-600 dark:text-orange-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Complete Your Profile</h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                  Add more information to increase your visibility and attract better opportunities.
                </p>
                <AnimatedButton
                  variant="primary"
                  size="sm"
                  icon={<Edit size={14} />}
                  onClick={() => router.push("/profile/edit")}
                  className="w-full"
                >
                  Complete Now
                </AnimatedButton>
              </div>
            )}

            {/* Availability Status */}
            <div className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Availability</h3>
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                  Available
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                You're currently available for new projects
              </p>
              <AnimatedButton
                variant="outline"
                size="sm"
                icon={<Settings size={14} />}
                onClick={() => router.push("/profile/edit")}
                className="w-full"
              >
                Update Status
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
  change,
  changeType,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  change?: string;
  changeType?: "positive" | "negative";
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <div className={`${bgColor || "bg-white dark:bg-slate-800"} rounded-lg border ${borderColor || "border-slate-200 dark:border-slate-700"} shadow-sm p-4 hover:shadow-md transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 ${bgColor ? "bg-white/50 dark:bg-slate-800/50" : "bg-slate-100 dark:bg-slate-700"} rounded-lg`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            changeType === "positive" 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            {changeType === "positive" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
        {value}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{label}</p>
    </div>
  );
}

function DetailSection({
  title,
  icon,
  items,
  bgColor,
  borderColor,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ icon: React.ReactNode; label: string; value: string }>;
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${bgColor || "from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"} rounded-lg border ${borderColor || "border-slate-200 dark:border-slate-700"} shadow-sm p-6`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="text-slate-600 dark:text-slate-400 mt-0.5">{item.icon}</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
