import dotenv from 'dotenv';
import process from "node:process";
import nodemailer from "nodemailer";
import * as console from "node:console";

dotenv.config();
const GMAIL_USER: string | undefined = process.env.GMAIL_USER;
const GMAIL_APP_PASS: string | undefined = process.env.GMAIL_APP_PASS;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASS
    }
});

export default class MailSender {
    static async sendPdfToClient(recipientEmail: string, pdfBuffer: Buffer) {
        const mailOptions = {
            from: GMAIL_USER,
            to: recipientEmail,
            subject: 'Счёт на оплату услуг',
            text: 'Здравствуйте! Ваш счет за оплату выполненных услуг в приложении.',
            attachments: [
                {
                    filename: 'invoice.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                },
            ],
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Письмо успешно отправлено: ", info.response);
        } catch (error) {
            throw error;
        }
    }
}