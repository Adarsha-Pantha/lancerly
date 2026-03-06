"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Filter, Briefcase, Clock, DollarSign, MapPin, Star, ArrowRight, Grid, List, Calendar, Users, TrendingUp, Award, ChevronDown } from "lucide-react";
import { get } from "@/lib/api";

/** Shape returned by GET /projects */
interface ApiProject {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  skills: string[];
  status: string;
  createdAt: string;
  projectType?: string;
  client: {
    id: string;
    profile: { name: string; avatarUrl?: string | null } | null;
  };
  _count: { proposals: number };
}

/** Display shape used in list/grid */
interface ProjectCard {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetMin: number | null;
  budgetMax: number | null;
  skills: string[];
  clientName: string;
  proposals: number;
  status: string;
  postedAt: string;
  category: string;
}

const categories = [
  { id: "all", name: "All Categories", icon: "🌐" },
  { id: "web-development", name: "Web Development", icon: "💻" },
  { id: "mobile-development", name: "Mobile Development", icon: "📱" },
  { id: "design-creative", name: "Design & Creative", icon: "🎨" },
  { id: "writing-translation", name: "Writing & Translation", icon: "✍️" },
  { id: "marketing-sales", name: "Marketing & Sales", icon: "📈" },
  { id: "ai-data-science", name: "AI & Data Science", icon: "🤖" },
  { id: "business-finance", name: "Business & Finance", icon: "💼" },
  { id: "it-cybersecurity", name: "IT & Cybersecurity", icon: "🔒" }
];

const experienceLevels = [
  { id: "all", name: "All Levels" },
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "expert", name: "Expert" }
];

const budgetRanges = [
  { id: "all", name: "Any Budget", min: 0, max: Infinity },
  { id: "0-500", name: "Under $500", min: 0, max: 500 },
  { id: "500-1000", name: "$500 - $1,000", min: 500, max: 1000 },
  { id: "1000-5000", name: "$1,000 - $5,000", min: 1000, max: 5000 },
  { id: "5000+", name: "$5,000+", min: 5000, max: Infinity }
];

const sortOptions = [
  { id: "recent", name: "Most Recent" },
  { id: "budget-high", name: "Budget: High to Low" },
  { id: "budget-low", name: "Budget: Low to High" },
  { id: "proposals", name: "Most Proposals" },
  { id: "rating", name: "Client Rating" }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedBudget, setSelectedBudget] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, sortBy]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const list = await get<ApiProject[]>("/projects");
      const raw = Array.isArray(list) ? list : [];

      // Map API shape to display shape and apply filters
      let filteredProjects = raw
        .map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          budget: p.budgetMax ?? p.budgetMin ?? 0,
          budgetMin: p.budgetMin,
          budgetMax: p.budgetMax,
          skills: p.skills ?? [],
          clientName: p.client?.profile?.name ?? "Client",
          proposals: p._count?.proposals ?? 0,
          status: p.status,
          postedAt: p.createdAt,
          category: p.projectType ?? "CLIENT_REQUEST",
        }))
        .filter((project) => {
          const matchesSearch =
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
          const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
          const matchesBudget =
            selectedBudget === "all" ||
            (budgetRanges.find((r) => r.id === selectedBudget)?.min != null &&
              project.budget >= budgetRanges.find((r) => r.id === selectedBudget)!.min &&
              project.budget <= budgetRanges.find((r) => r.id === selectedBudget)!.max);
          const matchesLocation =
            selectedLocation === "all" ||
            (selectedLocation !== "" && project.description.toLowerCase().includes(selectedLocation.toLowerCase()));
          return matchesSearch && matchesCategory && matchesBudget && matchesLocation;
        });

      // Sort
      filteredProjects.sort((a, b) => {
        switch (sortBy) {
          case "budget-high":
            return b.budget - a.budget;
          case "budget-low":
            return a.budget - b.budget;
          case "proposals":
            return b.proposals - a.proposals;
          case "rating":
            return 0;
          default:
            return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        }
      });

      setProjects(filteredProjects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedExperience("all");
    setSelectedBudget("all");
    setSelectedLocation("all");
    setSearchTerm("");
  };

  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedExperience !== "all", 
    selectedBudget !== "all",
    selectedLocation !== "all",
    searchTerm !== ""
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-blue mb-2">Explore Projects</h1>
              <p className="text-slate-blue/70">Find exciting projects that match your skills</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/projects/mine"
                className="px-4 py-2 border border-slate-200 text-slate-blue rounded-xl hover:bg-slate-50 transition-colors"
              >
                My Projects
              </Link>
              <Link
                href="/projects/new"
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm hover:shadow-md"
              >
                <Briefcase size={20} />
                Post a Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-blue/60" size={20} />
            <input
              type="text"
              placeholder="Search projects, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-lg"
              suppressHydrationWarning
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Filter size={16} />
              <span className="text-sm font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-1 bg-emerald-500 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-6 bg-white rounded-xl border border-slate-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-blue mb-2">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Experience Level Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-blue mb-2">Experience Level</label>
                <div className="relative">
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {experienceLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Budget Range Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-blue mb-2">Budget Range</label>
                <div className="relative">
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {budgetRanges.map(range => (
                      <option key={range.id} value={range.id}>
                        {range.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-blue mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City or 'Remote'"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-500">
                {projects.length} projects found
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Sort and View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-emerald-500 text-white" : "text-slate-blue hover:bg-slate-50"
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-emerald-500 text-white" : "text-slate-blue hover:bg-slate-50"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-blue/60" />
            </div>
            <h3 className="text-xl font-semibold text-slate-blue mb-2">No projects found</h3>
            <p className="text-slate-blue/70 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-blue mb-2 line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-slate-blue/70 text-sm line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                      {project.status}
                    </span>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-emerald-500" />
                      <span className="font-medium text-slate-blue">
                        {project.budgetMin != null || project.budgetMax != null
                          ? `$${(project.budgetMin ?? 0).toLocaleString()} - $${(project.budgetMax ?? project.budgetMin ?? 0).toLocaleString()}`
                          : `$${project.budget.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-blue-500" />
                      <span className="text-slate-blue">
                        {new Date(project.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-orange-500" />
                      <span className="text-slate-blue">{project.proposals} proposals</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.slice(0, 3).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-blue text-xs rounded-full">
                        +{project.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Client Info and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {project.clientName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-blue">{project.clientName}</p>
                        <span className="text-xs text-slate-blue/60">{project.category}</span>
                      </div>
                    </div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
