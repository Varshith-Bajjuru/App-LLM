const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

class EmailService {
  static async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const htmlContent = `
      <h1>Welcome to Medical Chat App!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" 
         style="display: inline-block; background-color: #3B82F6; color: white; 
                padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                margin: 16px 0;">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>Verification link: ${verificationUrl}</p>
    `;

    const sender = {
      email: "23bds033@iiitdwd.ac.in",
      name: "Medical Chat App",
    };
    const receivers = [{ email }];

    try {
      await apiInstance.sendTransacEmail({
        sender,
        to: receivers,
        subject: "Verify Your Email",
        htmlContent,
      });
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email, token) {
    const sender = {
      email: "23bds033@iiitdwd.ac.in",
      name: "Medical Chat App",
    };
    const receivers = [{ email }];

    const htmlContent = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await apiInstance.sendTransacEmail({
        sender,
        to: receivers,
        subject: "Reset Your Password",
        htmlContent,
      });
      console.log("Password reset email sent successfully");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }
}

module.exports = EmailService;
