import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private extractor: any = null;
  private groq: Groq;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    this.groq = new Groq({ apiKey });
  }

  async onModuleInit() {
    this.logger.log('Initializing Xenova Transformers...');
    try {
      // Dynamic import because @xenova/transformers is ESM/CJS hybrid, often safer to dynamically import in NestJS to avoid top-level await issues.
      const { pipeline, env } = await import('@xenova/transformers');
      
      // Optional: avoid downloading models to strict local cache if needed, but defaults are usually fine.
      // env.localModelPath = './models';
      // env.allowLocalModels = false;

      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      this.logger.log('Transformer initialization complete.');
    } catch (err) {
      this.logger.error('Failed to initialize Xenova transformers', err);
    }
  }

  /**
   * Generates a Float[] embedding for the given text.
   * Returns empty array if extraction fails.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.extractor || !text?.trim()) return [];
    
    try {
      // output is a Tensor of shape [1, L, 384]. We generally want the mean pooled, or just the first token [CLS]
      const output = await this.extractor(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (error) {
      this.logger.error('Error generating embedding', error);
      return [];
    }
  }

  /**
   * Computes the cosine similarity between two numeric arrays.
   */
  computeCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

  if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Refines a project brief using Groq LLM.
   * Returns a structured object with refined description, questions, and criteria.
   */
  async refineBrief(title: string, description: string) {
    if (!title || !description) return null;

    try {
      const prompt = `
        You are an expert project manager and technical recruiter. 
        I need you to refine a project brief to make it professional, clear, and highly attractive to top-tier freelancers.
        
        Project Title: ${title}
        Original Description: ${description}

        Please provide your response in strictly VALID JSON format with the following keys:
        1. "refinedDescription": A professional, well-structured version of the description (using markdown for bolding/lists if needed).
        2. "screeningQuestions": Array of 3 specific questions to ask freelancers during their proposal.
        3. "acceptanceCriteria": Array of 4-5 clear points that define a successful project completion.

        Ensure the tone is professional yet approachable. Do not include any text outside the JSON block.
      `;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      const response = chatCompletion.choices[0]?.message?.content;
      if (!response) return null;

      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Error refining brief with Groq', error);
      return null;
    }
  }
}
