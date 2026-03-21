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
   * Analyzes text for spam, toxicity, and policy violations using Groq LLM
   */
  async analyzeContent(text: string): Promise<ModerationResult> {
    this.logger.warn(`MODERATION SCAN START: "${text.substring(0, 50)}..."`);
    if (!text || text.trim().length === 0) return { status: 'APPROVED', notes: null };

    const lowerText = text.toLowerCase();
    
    // HARD BLOCK - Explicit keywords
    const strictlyForbidden = ['porn', 'nude', 'sex', 'xxx', 'hentai', 'naked', 'nude'];
    if (strictlyForbidden.some(word => lowerText.includes(word))) {
      const found = strictlyForbidden.find(w => lowerText.includes(w));
      this.logger.error(`!!! HARD BLOCK TRIGGERED !!! Found forbidden word: ${found}`);
      return { status: 'BLOCKED', notes: 'Content contains strictly prohibited language.' };
    }

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a strict content moderation assistant for Lancerly, a freelancing platform.
Analyze the user-provided text for:
1. Adult content (sex, porn, etc.) - BLOCKED
2. Off-platform contact sharing (Gmail, WhatsApp, Phone numbers, Telegram, etc.) - FLAGGED
3. Spam or phishing links - FLAGGED
4. Hate speech or harassment - BLOCKED
5. General policy violations.

Response Format: Return ONLY a valid JSON object:
{ "status": "APPROVED" | "FLAGGED" | "BLOCKED", "notes": "Brief reason if not approved" }`
          },
          {
            role: 'user',
            content: text
          }
        ],
        model: 'llama3-70b-8192',
        response_format: { type: 'json_object' }
      });

      const rawContent = completion.choices[0]?.message?.content || '{}';
      const response = JSON.parse(rawContent);
      
      this.logger.log(`LLM Moderation Result: ${response.status} - ${response.notes}`);
      
      return {
        status: response.status || 'APPROVED',
        notes: response.notes || null
      };

    } catch (error) {
      console.error('[ModerationService] AI Error:', error.message);
      return this.fallbackModeration(text);
    }
  }

  /**
   * Basic rule-based fallback if LLM is unavailable
   */
  private fallbackModeration(text: string): ModerationResult {
    const lowerText = text.toLowerCase();
    const violations: string[] = [];

    const explicitWords = ['porn', 'sex', 'nsfw', 'xxx', 'hentai'];
    if (explicitWords.some(word => lowerText.includes(word))) {
      return { status: 'BLOCKED', notes: 'Blocked for explicit content (fallback)' };
    }

    const contactKeywords = ['@gmail.com', 'whatsapp', 'phone', 'reach me at'];
    if (contactKeywords.some(keyword => lowerText.includes(keyword))) {
      return { status: 'FLAGGED', notes: 'Flagged for contact info (fallback)' };
    }

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
        model: 'llama3-70b-8192',
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
