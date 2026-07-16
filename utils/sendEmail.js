// const nodemailer = require("nodemailer");

// module.exports.sendEmail = async (userEmail, otpCode) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.elasticemail.com",
//   port: 2525,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },

//     tls: {
//       rejectUnauthorized: false, // লোকালহোস্টের সিকিউরিটি ব্লক এড়ানোর জন্য
//     },
//   });

//   const mailOptions = {
//     from: '"QNotes Support" <support@qnotes.com>',
//     to: userEmail.trim(),
//     subject: "Verify Your Email - QNotes",
//     html: `
//             <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; margin: auto; border-radius: 8px;">
//                 <h2 style="color: #dc3545; text-align: center;">QNotes Authentication</h2>
//                 <p>Hello,</p>
//                 <p>Thank you for registering at QNotes. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 5 minutes.</p>
//                 <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333; border-radius: 4px; margin: 20px 0;">
//                     ${otpCode}
//                 </div>
//                 <p style="color: #777; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
//             </div>
//         `,
//   };
//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully: " + info.messageId);
//     return true;
//   } catch (error) {
//     console.error("Nodemailer Error: ", error);
//     return false;
//   }
// };

const { BrevoClient } = require('@getbrevo/brevo');

// ১. নতুন আপডেটেড নিয়ম অনুযায়ী ক্লায়েন্ট তৈরি করুন
const brevo = new BrevoClient({
    apiKey:process.env.BREVO_API_KEY // Render বা .env থেকে কি নিবে
});

// এখানে প্যারামিটারে dynamic OTP রিসিভ করার জন্য 'otp' যোগ করা হলো
function sendVerificationEmail(userEmail, userName, otp) {
    
    // ২. সরাসরি brevo.transactionalEmails.sendTransacEmail ব্যবহার করুন
    brevo.transactionalEmails.sendTransacEmail({
        subject: "Verify Your Account - QNotes-Archive",
        sender: {
            name: "QNotes-Archive",
            email: "raselhasanshovo@gmail.com", // Brevo তে ভেরিফাইড প্রেরক ইমেইল
        },
        to: [{ email: userEmail, name: userName }],
        // এখানে HTML বডিতে ওটিপিটি বসানো হলো
        htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2>Hello ${userName},</h2>
                <p>Welcome to QNotes-Archive! Your account registration is almost complete.</p>
                <p>Use the following One-Time Password (OTP) to verify your email address. <strong>This OTP is valid for 5 minutes.</strong></p>
                <h1 style="background: #f3f3f3; padding: 10px; text-align: center; letter-spacing: 5px; color: #333;">${otp}</h1>
                <p>If you did not request this code, please ignore this email.</p>
            </div>
        `
    })
    .then(function(data) {
        console.log('OTP Email sent successfully! Data:', JSON.stringify(data));
    })
    .catch(function(error) {
        console.error('Brevo API Error:', error);
    });
}

// সঠিকভাবে অবজেক্ট আকারে ফাংশনটি এক্সপোর্ট করুন
module.exports = { sendVerificationEmail };
