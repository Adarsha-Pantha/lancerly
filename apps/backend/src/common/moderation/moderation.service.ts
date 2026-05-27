import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

type ModerationStatus = 'APPROVED' | 'PENDING' | 'FLAGGED' | 'BLOCKED';

export interface ModerationResult {
  status: ModerationStatus;
  notes: string | null;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  // Simple lists for demonstration - in production, use a dedicated AI service or external API
  private readonly bannedWords = [
    'scam', 'fraud', 'illegal', 'hack', 'phishing', 
    // Add common harmful words here
  ];

  private readonly groq: Groq;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    this.groq = new Groq({ apiKey });
  }

  /**
   * Analyzes text for spam, toxicity, and policy violations
   * Currently very permissive to avoid false positives
   */
  async analyzeContent(text: string): Promise<ModerationResult> {
    this.logger.warn(`MODERATION SCAN START: "${text?.substring(0, 50)}..."`);
    
    // Approve empty or very short content
    if (!text || text.trim().length < 5) {
      this.logger.log(`Content approved (empty/short): "${text?.substring(0, 50)}..."`);
      return { status: 'APPROVED', notes: null };
    }

    const lowerText = text.toLowerCase();
    
    // Only block extremely explicit content
    const strictlyForbidden = ['porn', 'nude', 'xxx'];
    if (strictlyForbidden.some(word => lowerText.includes(word))) {
      const found = strictlyForbidden.find(w => lowerText.includes(w));
      this.logger.error(`!!! HARD BLOCK TRIGGERED !!! Found forbidden word: ${found}`);
      return { status: 'BLOCKED', notes: 'Content contains strictly prohibited language.' };
    }

    // Approve everything else
    this.logger.log(`Content approved: "${text.substring(0, 50)}..."`);
    return { status: 'APPROVED', notes: null };
  }

  /**
   * Basic rule-based fallback if LLM is unavailable
   */
  private fallbackModeration(text: string): ModerationResult {
    const lowerText = text.toLowerCase();

    // Only block truly explicit content
    const explicitWords = ['porn', 'nude'];
    if (explicitWords.some(word => lowerText.includes(word))) {
      return { status: 'BLOCKED', notes: 'Blocked for explicit content (fallback)' };
    }

    // Approve everything else
    return { status: 'APPROVED', notes: null };
  }

  /**
   * Automatically rewrites flagged or inappropriate text into professional language.
   * preserving the original intent but removing policy violations.
   */
  async sanitizeContent(text: string): Promise<string> {
    if (!text || text.trim().length === 0) return text;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a professional content editor for Lancerly, a freelancing platform.
Your task is to rewrite user content to be cleaner, more professional, and policy-compliant.
- Original intent must be preserved.
- Remove adult content, curse words, and off-platform contact info (emails, phone numbers).
- If the content is purely illegal or too inappropriate to rewrite, return a generic professional placeholder like "[Content removed for policy violation]".
- Return ONLY the sanitized text, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const sanitized = completion.choices[0]?.message?.content?.trim() || text;
      this.logger.log(`Sanitized content: "${sanitized.substring(0, 50)}..."`);
      return sanitized;
    } catch (error) {
      this.logger.error('Sanitization failed, applying basic censor star fallback', error);
      // Basic fallback: just replace Gmail/Phone/Porn with stars if AI fails
      return text.replace(/porn|sex|nude|xxx|hentai/gi, '****')
                 .replace(/[a-zA-Z0-0._%+-]+@gmail\.com/gi, '[email hidden]')
                 .replace(/\+?[0-9]{7,12}/g, '[phone hidden]');
    }
  }

  /**
   * Generic method to moderate an entity's content and update it in DB
   */
  async moderateEntity(
    entityType: 'PROJECT' | 'PROPOSAL' | 'MESSAGE' | 'REVIEW',
    entityId: string,
    content: string,
  ): Promise<ModerationResult> {
    const result = await this.analyzeContent(content);

    if (result.status !== 'APPROVED') {
      this.logger.warn(`Entity ${entityType}:${entityId} flagged: ${result.notes}`);
      
      const updateData = {
        moderationStatus: result.status,
        moderationNotes: result.notes,
      } as any;

      try {
        if (entityType === 'PROJECT') {
          await (this.prisma.project as any).update({ where: { id: entityId }, data: updateData });
        } else if (entityType === 'PROPOSAL') {
          await (this.prisma.proposal as any).update({ where: { id: entityId }, data: updateData });
        } else if (entityType === 'MESSAGE') {
          await (this.prisma.message as any).update({ where: { id: entityId }, data: updateData });
        } else if (entityType === 'REVIEW') {
          await (this.prisma as any).review.update({ where: { id: entityId }, data: updateData });
        }
      } catch (err) {
        this.logger.error(`Failed to update moderation status for ${entityType}:${entityId}`, err);
      }
    }

    return result;
  }
}
