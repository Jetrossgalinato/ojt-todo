import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;

  private getClient(): Resend {
    if (!this.resend) {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not set');
      }
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    return this.resend;
  }

  private isConfigured(): boolean {
    return !!process.env.RESEND_API_KEY;
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    if (!this.isConfigured()) {
      console.log(
        `[dev] RESEND_API_KEY not set — password reset link for ${to}: ${resetLink}`,
      );
      return;
    }

    await this.getClient().emails.send({
      from: 'onboarding@resend.dev', // default sender, safe para sa dev/testing
      to,
      subject: 'Reset your password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset your password. Click the button below to set a new one.</p>
          <a href="${resetLink}" style="display:inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Reset Password
          </a>
          <p>This link will expire in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  async sendTaskEmail(to: string, subject: string, taskDetails: string) {
    if (!this.isConfigured()) {
      console.log(
        `[dev] RESEND_API_KEY not set — skipping email to ${to}: ${subject}`,
      );
      return;
    }

    await this.getClient().emails.send({
      from: 'onboarding@resend.dev', // default sender, safe para sa dev/testing
      to,
      subject,
      html: taskDetails,
    });
  }
}
