const SibApiV3Sdk = require("sib-api-v3-sdk");

class EmailService {
  constructor() {
    this.apiInstance = null;
    this.initialize();
  }

  initialize() {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendVerificationEmail(email, token) {
    const sendSmtpEmail = {
      sender: {
        email: "23bds033@iiitdwd.ac.in",
        name: "Medical Chat App",
      },
      to: [{ email }],
      subject: "Verify Your Email Address",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Medical Chat App!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}"
             style="display: inline-block; background-color: #2563eb; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                    margin: 16px 0;">
            Verify Email
          </a>
          <p>This link will expire in 24 hours.</p>
          <p style="color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log("Verification email sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, token) {
    const sendSmtpEmail = {
      sender: {
        email: "23bds033@iiitdwd.ac.in",
        name: "Medical Chat App",
      },
      to: [{ email }],
      subject: "Reset Your Password",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}"
             style="display: inline-block; background-color: #2563eb; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                    margin: 16px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log("Password reset email sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }
}

// Create a singleton instance
const emailService = new EmailService();
module.exports = emailService;
