const nodemailer = require("nodemailer");

module.exports.sendEmail = async (userEmail, otpCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true, // সিকিউর কানেকশন
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

   tls: {
    rejectUnauthorized: false // লোকালহোস্টের সিকিউরিটি ব্লক এড়ানোর জন্য
  }
  });

  const mailOptions = {
    from: `"QNotes Archive" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Verify Your Email - QNotes",
    html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; margin: auto; border-radius: 8px;">
                <h2 style="color: #dc3545; text-align: center;">QNotes Authentication</h2>
                <p>Hello,</p>
                <p>Thank you for registering at QNotes. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 5 minutes.</p>
                <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333; border-radius: 4px; margin: 20px 0;">
                    ${otpCode}
                </div>
                <p style="color: #777; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
            </div>
        `,
  };
  await transporter.sendMail(mailOptions);
};
