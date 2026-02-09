const nodemailer = require('nodemailer');

const sendApprovalEmail = async (userEmail, userName) => {
    try {
        // Create transporter
        // Ideally, these credentials should be in .env
        // For development/demo without explicit SMTP, we can use Ethereal or just log
        // But the user asked for Nodemailer.
        // If no env vars are present, we'll log the email content to console to avoid crashing
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('⚠️  Email credentials not found. Mocking email send.');
            console.log(`📧 To: ${userEmail}`);
            console.log(`SUBJECT: Access Granted to Saarang ClubSync`);
            console.log(`BODY: Hi ${userName}, Your request to access Saarang ClubSync has been approved...`);
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail', // or 'Outlook', etc.
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Access Granted to Saarang ClubSync',
            html: `
                <div style="font-family: sans-serif; color: #292929; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="font-weight: 300; letter-spacing: -0.5px;">Welcome, ${userName}.</h2>
                    <p style="line-height: 1.6;">
                        Your request to access <strong>Saarang ClubSync</strong> has been approved.
                    </p>
                    <p>
                        You are now part of the Saarang workspace. You can log in and view the club's rhythm.
                    </p>
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: #292929; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
                        Enter ClubSync
                    </a>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
                    <p style="font-size: 0.8rem; color: #888;">
                        This is an automated message from the Saarang Music Club system.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Approval email sent to ${userEmail}`);

    } catch (error) {
        console.error('❌ Error sending approval email:', error.message);
        // Do not throw error to avoid breaking the approval flow
    }
};

module.exports = { sendApprovalEmail };
