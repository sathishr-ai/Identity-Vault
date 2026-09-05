package com.blockid.platform.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendEmail(String toEmail, String subject, String content) {
        if (toEmail == null || toEmail.isBlank())
            return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("\"Identity Vault\" <sathish.r.dev1610@gmail.com>");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, true); // true indicates HTML

            mailSender.send(message);
            System.out.println("\n[EMAIL 200 OK] Notification sent successfully to: " + toEmail + "\n");
        } catch (Exception e) {
            System.err.println("\n==== EMAIL FAILURE CAUGHT ====");
            System.err.println("Make sure your App Password is correct in application.properties!");
            System.err.println("Error: " + e.getMessage());
            System.err.println("===============================\n");
        }
    }

    public void sendApprovalEmail(String toEmail, String userName, String documentNames) {
        String subject = "✅ Verification Successful - Identity Vault [#" + (int) (Math.random() * 9000 + 1000) + "]";
        String htmlBody = "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; background-color: #030712; color: #e2e8f0; border-radius: 16px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);\">"
                +
                "<h2 style=\"color: #10b981; margin-top: 0; font-size: 24px; text-align: center;\">Verification Successful</h2>"
                +
                "<p style=\"font-size: 16px; line-height: 1.5; color: #e2e8f0;\">Hello <b>" + userName + "</b>,</p>" +
                "<p style=\"font-size: 15px; color: #94a3b8; line-height: 1.5;\">Your documents (<b>" + documentNames
                + "</b>) have been successfully verified by our administrators.</p>" +
                "<p style=\"font-size: 15px; color: #94a3b8; line-height: 1.5;\">Your Identity Profile is now officially active and secure.</p>"
                +
                "<div style=\"text-align: center; margin: 30px 0;\">" +
                "<a href=\"http://localhost:5173\" style=\"background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);\">Go to Dashboard ➔</a>"
                +
                "</div>" +
                "<hr style=\"border: 0; border-top: 1px solid #1e293b; margin: 25px 0;\">" +
                "<p style=\"font-size: 12px; color: #64748b; text-align: center;\">— The Identity Vault Team</p>" +
                "</div>";
        sendEmail(toEmail, subject, htmlBody);
    }

    public void sendRejectionEmail(String toEmail, String userName, String documentNames, String reasons) {
        String subject = "❌ Verification Required - Identity Vault [#" + (int) (Math.random() * 9000 + 1000) + "]";
        String htmlBody = "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; background-color: #030712; color: #e2e8f0; border-radius: 16px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);\">"
                +
                "<h2 style=\"color: #ef4444; margin-top: 0; font-size: 24px; text-align: center;\">Action Required</h2>"
                +
                "<p style=\"font-size: 16px; line-height: 1.5; color: #e2e8f0;\">Hello <b>" + userName + "</b>,</p>" +
                "<p style=\"font-size: 15px; color: #94a3b8; line-height: 1.5;\">We were unable to verify your submitted documents (<b>"
                + documentNames + "</b>).</p>" +
                "<div style=\"background: linear-gradient(145deg, #1c0a0a, #1a0505); border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; font-size: 15px; margin: 20px 0; color: #fca5a5;\">"
                +
                "<b>Reason provided:</b><br>" + reasons +
                "</div>" +
                "<p style=\"font-size: 14px; color: #94a3b8;\">Please log back into the portal and re-upload clearer copies to complete your identity verification.</p>"
                +
                "<div style=\"text-align: center; margin: 30px 0;\">" +
                "<a href=\"http://localhost:5173\" style=\"background-color: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);\">Upload New Document ➔</a>"
                +
                "</div>" +
                "<hr style=\"border: 0; border-top: 1px solid #1e293b; margin: 25px 0;\">" +
                "<p style=\"font-size: 12px; color: #64748b; text-align: center;\">— The Identity Vault Team</p>" +
                "</div>";
        sendEmail(toEmail, subject, htmlBody);
    }

    public void sendOtpEmail(String toEmail, String otpToken, String type) {
        boolean isRegister = "register".equalsIgnoreCase(type);
        String subjectLine = (isRegister ? "Identity Vault - Account Verification [#"
                : "Identity Vault - Password Reset Verification [#") + (int) (Math.random() * 9000 + 1000) + "]";

        String introText = isRegister ? "Welcome to Identity Vault! We're thrilled to have you." : "Hello,";
        String explanationText = isRegister
                ? "Please verify your email address to complete your account registration securely."
                : "We received a request to securely reset the password for your Identity Vault account.";

        String htmlBody = "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; background-color: #030712; color: #e2e8f0; border-radius: 16px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);\">"
                +
                "<h2 style=\"color: #38bdf8; margin-top: 0; font-size: 24px; text-align: center;\">Identity Vault</h2>"
                +
                "<p style=\"font-size: 16px; line-height: 1.5;\">" + introText + "</p>" +
                "<p style=\"font-size: 15px; color: #94a3b8; line-height: 1.5;\">" + explanationText + "</p>" +
                "<div style=\"background: linear-gradient(145deg, #1A1A1C, #131315); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 30px 0; color: #fff;\">"
                +
                otpToken +
                "</div>" +
                "<p style=\"font-size: 14px; color: #94a3b8;\">Please enter this 6-digit OTP on the screen to verify your identity.</p>"
                +
                "<hr style=\"border: 0; border-top: 1px solid #1e293b; margin: 25px 0;\">" +
                "<p style=\"font-size: 12px; color: #64748b; text-align: center;\">If you did not request this, please securely ignore this email or contact support.</p>"
                +
                "</div>";

        sendEmail(toEmail, subjectLine, htmlBody);
    }
}
