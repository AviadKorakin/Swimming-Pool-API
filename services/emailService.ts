// @ts-ignore
import nodemailer from 'nodemailer';
require('dotenv').config(); // Ensure environment variables are loaded

// Create a transporter object
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use Gmail as the email service
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASS, // Your App Password
    },
});

// Send confirmation email
export const sendConfirmationEmail = async (email: any, userId: any) => {
    const confirmationLink = `http://localhost:5000/api/users/confirm/${userId}`;
    const mailOptions = {
        from: `"Swimming Pool API" <${process.env.EMAIL}>`, // Replace placeholder with actual email
        to: email,
        subject: 'Confirm Your Email',
        html: `<p>Please confirm your email by clicking <a href="${confirmationLink}">here</a>.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending confirmation email to ${email}:`, error);
    }
};

module.exports = { sendConfirmationEmail };
