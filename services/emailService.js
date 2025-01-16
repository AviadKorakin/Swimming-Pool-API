"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConfirmationEmail = void 0;
// @ts-ignore
const nodemailer_1 = __importDefault(require("nodemailer"));
require('dotenv').config(); // Ensure environment variables are loaded
// Create a transporter object
const transporter = nodemailer_1.default.createTransport({
    service: 'Gmail', // Use Gmail as the email service
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASS, // Your App Password
    },
});
// Send confirmation email
const sendConfirmationEmail = (email, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const confirmationLink = `http://localhost:5000/api/users/confirm/${userId}`;
    const mailOptions = {
        from: `"Swimming Pool API" <${process.env.EMAIL}>`, // Replace placeholder with actual email
        to: email,
        subject: 'Confirm Your Email',
        html: `<p>Please confirm your email by clicking <a href="${confirmationLink}">here</a>.</p>`,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${email}`);
    }
    catch (error) {
        console.error(`Error sending confirmation email to ${email}:`, error);
    }
});
exports.sendConfirmationEmail = sendConfirmationEmail;
module.exports = { sendConfirmationEmail: exports.sendConfirmationEmail };
