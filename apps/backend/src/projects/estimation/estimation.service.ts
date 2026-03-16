import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../../common/moderation/moderation.service';

@Injectable()
export class EstimationService {
  private readonly logger = new Logger(EstimationService.name);

  constructor(
    private prisma: PrismaService,
    private readonly moderationService: ModerationService,
  ) {}

  async getEstimate(data: { title: string; description: string; skills: string[] }) {
    this.logger.log(`Generating estimate for: ${data.title}`);

    // AI Content Moderation scan
    const moderation = await this.moderationService.analyzeContent(`${data.title} ${data.description}`);
    if (moderation.status === 'FLAGGED' || moderation.status === 'BLOCKED') {
      throw new BadRequestException(`Estimation rejected: ${moderation.notes}`);
    }

    // 1. Fetch COMPLETED projects with their contracts
    const completedProjects = await this.prisma.project.findMany({
      where: { status: 'COMPLETED' },
      include: {
        contract: true,
      },
    });

    if (completedProjects.length === 0) {
      return {
        suggestedBudget: { min: 500, max: 2000 },
        suggestedDuration: 14,
        confidence: 50,
        matchedReason: 'No historical data available yet. Using market defaults.',
        complexity: 'Medium' as const,
      };
    }

    const query = (data.title + ' ' + data.description + ' ' + (data.skills || []).join(' ')).toLowerCase();
    const querySkills = (data.skills || []).map(s => s.toLowerCase());

    // 2. Simple Semantic/Keyword Similarity Matching (KNN-like)
    const scoredProjects = completedProjects.map((project) => {
      let score = 0;
      const projectText = (project.title + ' ' + project.description + ' ' + (project.skills || []).join(' ')).toLowerCase();
      const projectSkills = (project.skills || []).map(s => s.toLowerCase());

      // Keyword overlap
      const words = query.split(/\s+/).filter(w => w.length > 3);
      words.forEach(word => {
        if (projectText.includes(word)) score += 1;
      });

      // Skill overlap (heavy weight)
      const commonSkills = querySkills.filter(s => projectSkills.includes(s));
      score += commonSkills.length * 10;

      return { project, score };
    });

    // 3. Sort by score and take top matches
    scoredProjects.sort((a, b) => b.score - a.score);
    const topMatches = scoredProjects.slice(0, 3).filter(m => m.score > 0);

    if (topMatches.length === 0) {
      // Fallback if no relevant projects found
      return {
        suggestedBudget: { min: 1000, max: 3000 },
        suggestedDuration: 21,
        confidence: 40,
        matchedReason: 'Found no direct matches. Suggesting based on general project scale.',
        complexity: 'Medium' as const,
      };
    }

    // 4. Aggregate data from top matches
    let avgBudget = 0;
    let avgDurationDays = 0;
    let totalScore = 0;

    topMatches.forEach((m) => {
      const budget = m.project.contract?.agreedBudget || ((m.project.budgetMin ?? 0) + (m.project.budgetMax ?? 0)) / 2 || 0;
      
      // Calculate practical duration
      const start = m.project.contract?.startDate || m.project.createdAt;
      const end = m.project.contract?.endDate || new Date();
      const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      avgBudget += budget * m.score;
      avgDurationDays += duration * m.score;
      totalScore += m.score;
    });

    avgBudget /= totalScore;
    avgDurationDays /= totalScore;

    // 5. Build the final estimate with variability
    const variance = 0.1; // 10% variance for the range
    const minBudget = Math.round((avgBudget * (1 - variance)) / 50) * 50;
    const maxBudget = Math.round((avgBudget * (1 + variance)) / 50) * 50;
    const duration = Math.ceil(avgDurationDays);

    const confidence = Math.min(Math.round((topMatches[0].score / 20) * 100), 95);
    const bestMatch = topMatches[0].project;

    return {
      suggestedBudget: { min: minBudget, max: maxBudget },
      suggestedDuration: duration,
      confidence,
      matchedReason: `Based on similar project: "${bestMatch.title.replace('[SEED] ', '')}"`,
      complexity: duration > 30 ? 'High' : duration > 10 ? 'Medium' : 'Low',
    };
  }
}
