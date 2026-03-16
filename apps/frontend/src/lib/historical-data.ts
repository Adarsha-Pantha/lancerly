export interface HistoricalProject {
  id: string;
  title: string;
  description: string;
  skills: string[];
  category: string;
  actualBudget: number;
  actualDurationDays: number;
  complexity: "Low" | "Medium" | "High";
}

export const HISTORICAL_PROJECTS: HistoricalProject[] = [
  {
    id: "hp1",
    title: "E-commerce Website with React and Stripe",
    description: "Built a full-featured e-commerce platform with product listings, cart, and checkout integration.",
    skills: ["React", "Node.js", "Stripe", "PostgreSQL"],
    category: "Web Development",
    actualBudget: 3500,
    actualDurationDays: 30,
    complexity: "High",
  },
  {
    id: "hp2",
    title: "Mobile App for Fitness Tracking",
    description: "Developed a cross-platform mobile app using React Native for tracking workouts and nutrition.",
    skills: ["React Native", "Firebase", "TypeScript"],
    category: "Mobile Development",
    actualBudget: 4500,
    actualDurationDays: 45,
    complexity: "High",
  },
  {
    id: "hp3",
    title: "Landing Page Redesign",
    description: "Modernized a SaaS landing page with high-converting sections and animations.",
    skills: ["Next.js", "Tailwind CSS", "Framer Motion"],
    category: "Design",
    actualBudget: 800,
    actualDurationDays: 7,
    complexity: "Low",
  },
  {
    id: "hp4",
    title: "API Integration for CRM",
    description: "Created a secure API bridge between a custom CRM and Salesforce.",
    skills: ["Node.js", "Express", "API", "Salesforce"],
    category: "Backend",
    actualBudget: 2200,
    actualDurationDays: 14,
    complexity: "Medium",
  },
  {
    id: "hp5",
    title: "Copywriting for Tech Blog - 10 Articles",
    description: "Wrote high-quality SEO-optimized technical articles for a software company blog.",
    skills: ["Content Writing", "SEO", "Technical Writing"],
    category: "Writing",
    actualBudget: 1200,
    actualDurationDays: 20,
    complexity: "Medium",
  },
  {
    id: "hp6",
    title: "Logo Design and Brand Identity",
    description: "Created a full brand kit including logo, business cards, and social media assets.",
    skills: ["Adobe Illustrator", "Graphic Design", "Branding"],
    category: "Design",
    actualBudget: 1500,
    actualDurationDays: 10,
    complexity: "Medium",
  },
  {
    id: "hp7",
    title: "Python Web Scraper for Market Analysis",
    description: "Built a robust scraper to extract product pricing from competitor websites.",
    skills: ["Python", "BeautifulSoup", "Selenium"],
    category: "Data Science",
    actualBudget: 600,
    actualDurationDays: 5,
    complexity: "Low",
  },
  {
    id: "hp8",
    title: "Dashboard UI Design (Figma)",
    description: "Designed a complex analytics dashboard with 12 screens and dark mode.",
    skills: ["Figma", "UI/UX Design"],
    category: "Design",
    actualBudget: 2800,
    actualDurationDays: 15,
    complexity: "High",
  },
  {
    id: "hp9",
    title: "Wordpress Site for Local Law Firm",
    description: "Standard 5-page WordPress site setup with contact forms and SEO basic setup.",
    skills: ["WordPress", "PHP", "Elementor"],
    category: "Web Development",
    actualBudget: 1200,
    actualDurationDays: 10,
    complexity: "Medium",
  },
  {
    id: "hp10",
    title: "Machine Learning Model for Sentiment Analysis",
    description: "Trained a BERT model to analyze customer feedback from social media.",
    skills: ["Python", "PyTorch", "NLP", "Scikit-learn"],
    category: "AI/ML",
    actualBudget: 5000,
    actualDurationDays: 30,
    complexity: "High",
  }
];

export async function estimateProject(data: { title: string; description: string; skills: string[] }) {
  // Simulate network delay for "AI"
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const query = (data.title + " " + data.description + " " + data.skills.join(" ")).toLowerCase();
  
  // Simple matching algorithm
  const matches = HISTORICAL_PROJECTS.map(p => {
    let score = 0;
    const pText = (p.title + " " + p.description + " " + p.skills.join(" ")).toLowerCase();
    
    // Check keyword overlaps
    const keywords = query.split(/\s+/).filter(k => k.length > 3);
    keywords.forEach(k => {
      if (pText.includes(k)) score += 1;
    });

    // Check skill overlaps
    const skillMatches = data.skills.filter(s => p.skills.some(ps => ps.toLowerCase() === s.toLowerCase()));
    score += skillMatches.length * 5;

    return { ...p, score };
  }).sort((a, b) => b.score - a.score);

  const topMatch = matches[0];
  
  // Add some randomness to budget and duration to make it feel real
  const variance = 0.15; // 15% variance
  const budgetFactor = 0.85 + Math.random() * (variance * 2);
  const durationFactor = 0.9 + Math.random() * (variance);

  const estimatedBudgetMin = Math.round((topMatch.actualBudget * 0.8) * budgetFactor / 50) * 50;
  const estimatedBudgetMax = Math.round((topMatch.actualBudget * 1.2) * budgetFactor / 50) * 50;
  const estimatedDurationDays = Math.round(topMatch.actualDurationDays * durationFactor);

  return {
    suggestedBudget: {
      min: estimatedBudgetMin,
      max: estimatedBudgetMax
    },
    suggestedDuration: estimatedDurationDays,
    confidence: Math.min(Math.round((topMatch.score / 10) * 100), 98),
    matchedReason: `Based on similar projects involving ${topMatch.skills.slice(0, 2).join(" and ")}.`,
    complexity: topMatch.complexity
  };
}
