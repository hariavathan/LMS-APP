const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: "gmail", // Use "gmail" or configure host/port manually
    auth: {
        user: process.env.SMTP_USER || "your-email@gmail.com", // Replace with env var
        pass: process.env.SMTP_PASS || "your-app-password", // Replace with env var
    },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"LMS Learning Platform" <no-reply@lms.com>', // sender address
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // Don't throw, just log so we don't break the app flow
        return null;
    }
};

/**
 * Send Welcome Email on Enrollment
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @param {string} courseTitle - Course Title
 * @param {string} courseLink - Link to the course
 */
const sendWelcomeEmail = async (to, userName, courseTitle, courseLink) => {
    const subject = `Welcome to the Family! Start ${courseTitle} Today 🚀`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                border: 1px solid #e0e0e0;
            }
            .header {
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
                letter-spacing: 0.5px;
            }
            .content {
                padding: 30px;
                color: #334155;
                font-size: 16px;
                line-height: 1.6;
            }
            .btn {
                display: inline-block;
                background-color: #4f46e5;
                color: white !important;
                padding: 15px 32px;
                border-radius: 50px;
                text-decoration: none;
                font-weight: bold;
                margin-top: 20px;
                box-shadow: 0 4px 6px rgba(79, 70, 229, 0.25);
                transition: transform 0.2s;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
            .footer {
                background-color: #f8fafc;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
            }
        </style>
    </head>
    <body style="background-color: #f1f5f9; padding: 20px; margin: 0;">
        <div class="email-container">
            <div class="header">
                <h1>Welcome, ${userName}! 👋</h1>
                <p style="margin-top: 10px; opacity: 0.9; font-size: 18px;">We're so excited to have you.</p>
            </div>
            <div class="content">
                <p>Hello <strong>${userName}</strong>,</p>
                <p>Great choice! You’ve just taken a huge step forward by enrolling in <strong>${courseTitle}</strong>. 🌟</p>
                <p>We believe in your potential to master this subject. Our platform is designed to make your learning journey consistent, engaging, and rewarding.</p>
                <p>Ready to jump in? Your first lesson is waiting for you.</p>
                
                <div style="text-align: center; padding: 20px 0;">
                    <a href="${courseLink}" class="btn">Start Learning Now</a>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
                    If the button doesn't work, you can copy and paste this link into your browser:<br>
                    <a href="${courseLink}" style="color: #4f46e5;">${courseLink}</a>
                </p>
            </div>
            <div class="footer">
                <p>Made with ❤️ by the LMS Team</p>
                <p>Keep learning, keep growing.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    return await sendEmail(to, subject, html);
};

/**
 * Send Assessment Reminder Email
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @param {string} courseTitle - Course Title
 * @param {string} courseLink - Link to the course
 * @param {number} progress - Current progress percentage
 */
const sendAssessmentReminderEmail = async (to, userName, courseTitle, courseLink, progress) => {
    const subject = `Don't Forget! Complete Your Assessment for ${courseTitle} ⏳`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
             .email-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                border: 1px solid #e0e0e0;
            }
            .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                padding: 30px 20px;
                text-align: center;
                color: white;
            }
            .content {
                padding: 30px;
                color: #334155;
                font-size: 16px;
                line-height: 1.6;
            }
            .btn {
                display: inline-block;
                background-color: #f59e0b;
                color: white !important;
                padding: 12px 28px;
                border-radius: 50px;
                text-decoration: none;
                font-weight: bold;
                margin-top: 20px;
            }
        </style>
    </head>
    <body style="background-color: #f1f5f9; padding: 20px; margin: 0;">
        <div class="email-container">
            <div class="header">
                <h1 style="margin:0; font-size: 24px;">Keep Going, ${userName}! 💪</h1>
            </div>
            <div class="content">
                <p>Hi <strong>${userName}</strong>,</p>
                <p>You are doing great in <strong>${courseTitle}</strong>, but you haven't finished yet!</p>
                <p>You are currently at <strong>${progress}% progress</strong>. The finish line is in sight.</p>
                <p>Complete your assessment to earn your certificate.</p>
                
                <div style="text-align: center; padding: 20px 0;">
                    <a href="${courseLink}" class="btn">Resume Learning</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    return await sendEmail(to, subject, html);
};

/**
 * Send Login Alert Email
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @param {string} time - Time of login
 */
const sendLoginAlertEmail = async (to, userName, time) => {
    const subject = `Login Alert: New Sign-in to Your Account 🔐`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                border: 1px solid #e0e0e0;
            }
            .header {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                padding: 30px;
                text-align: center;
                color: white;
                border-bottom: 4px solid #3b82f6;
            }
            .content {
                padding: 40px 30px;
                color: #334155;
            }
            .alert-box {
                background-color: #f8fafc;
                border-left: 4px solid #3b82f6;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .footer {
                background-color: #f1f5f9;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #64748b;
                border-top: 1px solid #e2e8f0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
                font-size: 14px;
            }
            .detail-label {
                color: #64748b;
            }
            .detail-value {
                font-weight: 600;
                color: #1e293b;
            }
        </style>
    </head>
    <body style="background-color: #e2e8f0; padding: 20px; margin: 0;">
        <div class="email-container">
            <div class="header">
                 <h2 style="margin:0; font-weight: 600;">Login Notification</h2>
            </div>
            <div class="content">
                <p style="margin-top: 0; font-size: 16px;">Hello <strong>${userName}</strong>,</p>
                
                <p>We detected a new login to your LMS account. If this was you, no action is needed.</p>

                <div class="alert-box">
                    <div class="detail-row">
                        <span class="detail-label">Time</span>
                        <span class="detail-value">${time}</span>
                    </div>
                     <div class="detail-row" style="border-bottom: none;">
                        <span class="detail-label">Status</span>
                        <span class="detail-value" style="color: #10b981;">Successful ✅</span>
                    </div>
                </div>

                <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
                    If you did not sign in recently, please <a href="#" style="color: #3b82f6; text-decoration: none;">reset your password</a> or contact support immediately.
                </p>
            </div>
            <div class="footer">
                <p>Secure Learning Management System</p>
                <p>Automated Security Alert • Do Not Reply</p>
            </div>
        </div>
    </body>
    </html>
    `;
    return await sendEmail(to, subject, html);
};

module.exports = { sendEmail, sendWelcomeEmail, sendAssessmentReminderEmail, sendLoginAlertEmail };
