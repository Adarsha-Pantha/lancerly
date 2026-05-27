import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../../common/moderation/moderation.service';
import Groq from 'groq-sdk';

// Market-rate lookup table: [type][complexity] => { min, max, days }
const MARKET_RATES: Record<string, Record<string, { min: number; max: number; days: number }>> = {
  web_development: {
    simple:     { min: 300,   max: 800,   days: 5  },
    medium:     { min: 1500,  max: 4000,  days: 21 },
    complex:    { min: 5000,  max: 12000, days: 45 },
    enterprise: { min: 15000, max: 40000, days: 90 },
  },
  mobile_app: {
    simple:     { min: 1000,  max: 3000,  days: 14 },
    medium:     { min: 4000,  max: 10000, days: 35 },
    complex:    { min: 12000, max: 30000, days: 75 },
    enterprise: { min: 35000, max: 80000, days: 120 },
  },
  design_ui_ux: {
    simple:     { min: 200,  max: 600,   days: 4  },
    medium:     { min: 800,  max: 2500,  days: 14 },
    complex:    { min: 3000, max: 8000,  days: 30 },
    enterprise: { min: 8000, max: 20000, days: 60 },
  },
  data_science_ml: {
    simple:     { min: 500,   max: 2000,  days: 7  },
    medium:     { min: 3000,  max: 8000,  days: 30 },
    complex:    { min: 10000, max: 25000, days: 60 },
    enterprise: { min: 25000, max: 60000, days: 120 },
  },
  devops_cloud: {
    simple:     { min: 300,   max: 1000,  days: 5  },
    medium:     { min: 1500,  max: 5000,  days: 21 },
    complex:    { min: 6000,  max: 18000, days: 45 },
    enterprise: { min: 20000, max: 50000, days: 90 },
  },
  blockchain: {
    simple:     { min: 2000,  max: 6000,  days: 14 },
    medium:     { min: 8000,  max: 20000, days: 45 },
    complex:    { min: 25000, max: 60000, days: 90 },
    enterprise: { min: 60000, max: 150000, days: 180 },
  },
  game_development: {
    simple:     { min: 500,   max: 2000,  days: 10 },
    medium:     { min: 3000,  max: 10000, days: 45 },
    complex:    { min: 12000, max: 40000, days: 90 },
    enterprise: { min: 40000, max: 120000, days: 180 },
  },
  content_writing_seo: {
    simple:     { min: 50,   max: 300,  days: 3  },
    medium:     { min: 300,  max: 1200, days: 10 },
    complex:    { min: 1200, max: 4000, days: 21 },
    enterprise: { min: 4000, max: 12000, days: 45 },
  },
  other: {
    simple:     { min: 200,  max: 800,   days: 7  },
    medium:     { min: 1000, max: 3500,  days: 21 },
    complex:    { min: 4000, max: 12000, days: 45 },
    enterprise: { min: 12000, max: 30000, days: 90 },
  },
};

@Injectable()
export class EstimationService {
  private readonly logger = new Logger(EstimationService.name);
  private groq: Groq;

  constructor(
    private prisma: PrismaService,
    private readonly moderationService: ModerationService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    this.groq = new Groq({ apiKey });
  }

  async getEstimate(data: { title: string; description: string; skills: string[] }) {
    this.logger.log(`Generating estimate for: ${data.title}`);

    // Content moderation scan
    const moderation = await this.moderationService.analyzeContent(`${data.title} ${data.description}`);
    if (moderation.status === 'FLAGGED' || moderation.status === 'BLOCKED') {
      throw new BadRequestException(`Estimation rejected: ${moderation.notes}`);
    }

    // Use Groq to classify project type and complexity
    const aiResult = await this.classifyWithGroq(data);

    const projectType = aiResult?.projectType ?? 'other';
    const complexity = aiResult?.complexity ?? 'medium';
    const reasoning = aiResult?.reasoning ?? 'AI-powered market rate estimate.';

    // Look up market rates
    const typeRates = MARKET_RATES[projectType] ?? MARKET_RATES['other'];
    const rates = typeRates[complexity] ?? typeRates['medium'];

    // Add small variance so min/max look natural
    const minBudget = Math.round((rates.min * 0.95) / 50) * 50;
    const maxBudget = Math.round((rates.max * 1.05) / 50) * 50;

    const complexityLabel =
      complexity === 'enterprise' ? 'Enterprise'
      : complexity === 'complex'  ? 'High'
      : complexity === 'medium'   ? 'Medium'
      : 'Low';

    return {
      suggestedBudget: { min: minBudget, max: maxBudget },
      suggestedDuration: rates.days,
      confidence: aiResult?.confidence ?? 70,
      matchedReason: reasoning,
      complexity: complexityLabel,
    };
  }

  private async classifyWithGroq(data: {
    title: string;
    description: string;
    skills: string[];
  }): Promise<{
    projectType: string;
    complexity: string;
    confidence: number;
    reasoning: string;
  } | null> {
    const prompt = `You are a freelance marketplace pricing expert. Analyze the following project and classify it.

Project Title: ${data.title}
Description: ${data.description}
Required Skills: ${(data.skills || []).join(', ') || 'Not specified'}

Return ONLY a valid JSON object with these exact keys:
- "projectType": one of ["web_development", "mobile_app", "design_ui_ux", "data_science_ml", "devops_cloud", "blockchain", "game_development", "content_writing_seo", "other"]
- "complexity": one of ["simple", "medium", "complex", "enterprise"]
  - simple = small task, minimal features, no integrations (e.g. basic landing page, simple script)
  - medium = moderate scope, some integrations, standard features (e.g. CRUD app, ecommerce site)
  - complex = large scope, many integrations, advanced features (e.g. SaaS platform, real-time app)
  - enterprise = large-scale system, team effort, highly complex (e.g. ERP, trading platform, large mobile ecosystem)
- "confidence": integer 60-95 representing how confident you are
- "reasoning": one sentence explaining the type and complexity choice

No extra text. Just the JSON.`;

    try {
      const chat = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const raw = chat.choices[0]?.message?.content;
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      // Validate keys
      const validTypes = Object.keys(MARKET_RATES);
      const validComplexities = ['simple', 'medium', 'complex', 'enterprise'];

      return {
        projectType: validTypes.includes(parsed.projectType) ? parsed.projectType : 'other',
        complexity: validComplexities.includes(parsed.complexity) ? parsed.complexity : 'medium',
        confidence: typeof parsed.confidence === 'number' ? Math.min(95, Math.max(60, parsed.confidence)) : 70,
        reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : 'AI-powered market rate estimate.',
      };
    } catch (err) {
      this.logger.error('Groq classification failed', err);
      return null;
    }
  }
}
