import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export type EmailTemplate =
  | 'welcome'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'contract_created'
  | 'milestone_funded'
  | 'milestone_approved'
  | 'milestone_paid'
  | 'delivery_submitted'
  | 'delivery_approved'
  | 'delivery_rejected'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'friend_request'
  | 'friend_accepted'
  | 'meeting_scheduled'
  | 'meeting_cancelled'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'password_changed'
  | 'email_verification';

interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  data?: Record<string, string | number>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromName = 'Lancerly';
  private readonly fromEmail: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('MAIL_FROM') || 'noreply@lancerly.com';
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Mail service initialized (SMTP: ${host}:${port})`);
    } else {
      this.logger.warn('SMTP_HOST/SMTP_USER/SMTP_PASS not configured — emails will be logged only');
    }
  }

  async send(opts: SendEmailOptions): Promise<void> {
    const { subject, html } = this.buildTemplate(opts.template, opts.data || {});

    if (!this.transporter) {
      // Dev mode: log email to console
      this.logger.debug(`[EMAIL → ${opts.to}] ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: opts.to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${opts.to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${opts.to}`, err);
    }
  }

  // ── Template Builder ──────────────────────────────────────────────────────
  private buildTemplate(
    template: EmailTemplate,
    data: Record<string, string | number>,
  ): { subject: string; html: string } {
    const d = (key: string, fallback = '') => String(data[key] ?? fallback);

    const templates: Record<EmailTemplate, { subject: string; body: string }> = {
      welcome: {
        subject: 'Welcome to Lancerly 🎉',
        body: `<p>Hi ${d('name')},</p><p>Welcome to Lancerly! Your account is ready. <a href="${this.appUrl}/dashboard">Get started →</a></p>`,
      },
      email_verification: {
        subject: 'Verify your Lancerly email',
        body: `<p>Hi ${d('name')},</p><p>Click below to verify your new email address:</p><p><a href="${d('link')}">Verify Email →</a></p><p>This link expires in 24 hours.</p>`,
      },
      password_changed: {
        subject: 'Your Lancerly password was changed',
        body: `<p>Hi ${d('name')},</p><p>Your password was successfully updated. If you didn't do this, contact support immediately.</p>`,
      },
      proposal_accepted: {
        subject: `🎉 Your proposal was accepted — ${d('projectTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>Great news! Your proposal for <strong>${d('projectTitle')}</strong> has been accepted. <a href="${this.appUrl}/contracts/me">View your contract →</a></p>`,
      },
      proposal_rejected: {
        subject: `Proposal update — ${d('projectTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>Unfortunately your proposal for <strong>${d('projectTitle')}</strong> was not selected this time. Keep applying!</p>`,
      },
      contract_created: {
        subject: `Contract created — ${d('projectTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>A contract has been created for <strong>${d('projectTitle')}</strong>. <a href="${this.appUrl}/contracts/${d('contractId')}">View contract →</a></p>`,
      },
      milestone_funded: {
        subject: `Milestone funded — ${d('milestoneTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>The client has funded the milestone <strong>${d('milestoneTitle')}</strong> ($${d('amount')}). Funds are held in escrow until approved.</p>`,
      },
      milestone_approved: {
        subject: `Milestone approved — ${d('milestoneTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>Your milestone <strong>${d('milestoneTitle')}</strong> has been approved! Payment will be released.</p>`,
      },
      milestone_paid: {
        subject: `💰 Payment released — ${d('milestoneTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>$${d('amount')} has been released to your Stripe account for milestone <strong>${d('milestoneTitle')}</strong>.</p>`,
      },
      delivery_submitted: {
        subject: `New delivery submitted — ${d('projectTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>${d('freelancerName')} has submitted a delivery for <strong>${d('projectTitle')}</strong>. <a href="${this.appUrl}/contracts/${d('contractId')}/deliveries">Review it →</a></p>`,
      },
      delivery_approved: {
        subject: `Delivery approved — ${d('projectTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>Your delivery for <strong>${d('projectTitle')}</strong> was approved! Great work.</p>`,
      },
      delivery_rejected: {
        subject: `Delivery needs revision — ${d('projectTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>Your delivery for <strong>${d('projectTitle')}</strong> requires changes. Feedback: <em>${d('feedback')}</em></p>`,
      },
      dispute_opened: {
        subject: `⚠️ Dispute opened — ${d('projectTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>A dispute has been opened on contract <strong>${d('projectTitle')}</strong>. Our team will review it within 48 hours.</p>`,
      },
      dispute_resolved: {
        subject: `Dispute resolved — ${d('projectTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>The dispute on <strong>${d('projectTitle')}</strong> has been resolved. Resolution: <em>${d('resolution')}</em></p>`,
      },
      friend_request: {
        subject: `${d('senderName')} sent you a connection request`,
        body: `<p>Hi ${d('name')},</p><p><strong>${d('senderName')}</strong> wants to connect with you on Lancerly. <a href="${this.appUrl}/friends">View request →</a></p>`,
      },
      friend_accepted: {
        subject: `${d('acceptorName')} accepted your connection request`,
        body: `<p>Hi ${d('name')},</p><p><strong>${d('acceptorName')}</strong> is now connected with you on Lancerly.</p>`,
      },
      meeting_scheduled: {
        subject: `📞 Audio meeting scheduled — ${d('meetingTitle')}`,
        body: `<p>Hi ${d('name')},</p><p><strong>${d('schedulerName')}</strong> scheduled an audio meeting: <strong>${d('meetingTitle')}</strong> on ${d('scheduledAt')}. <a href="${this.appUrl}/contracts/${d('contractId')}">View contract →</a></p>`,
      },
      meeting_cancelled: {
        subject: `Meeting cancelled — ${d('meetingTitle')}`,
        body: `<p>Hi ${d('name')},</p><p>The meeting <strong>${d('meetingTitle')}</strong> has been cancelled.</p>`,
      },
      kyc_approved: {
        subject: '✅ Identity verified — KYC Approved',
        body: `<p>Hi ${d('name')},</p><p>Your identity has been verified! You can now receive payments on Lancerly.</p>`,
      },
      kyc_rejected: {
        subject: 'KYC Verification — Action Required',
        body: `<p>Hi ${d('name')},</p><p>Your KYC verification was rejected. Reason: <em>${d('reason')}</em>. Please resubmit your documents.</p>`,
      },
    };

    const t = templates[template];
    return {
      subject: t.subject,
      html: this.wrapHtml(t.subject, t.body),
    };
  }

  private wrapHtml(title: string, body: string): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1e0e3e,#6B4EFF);padding:24px 32px;">
      <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Lancerly</span>
    </div>
    <div style="padding:32px;color:#374151;font-size:15px;line-height:1.6;">
      ${body}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
      <p style="font-size:12px;color:#9ca3af;">You're receiving this because you have an account on Lancerly. <a href="${this.appUrl}/settings" style="color:#6B4EFF;">Manage preferences</a></p>
    </div>
  </div>
</body>
</html>`;
  }
}
