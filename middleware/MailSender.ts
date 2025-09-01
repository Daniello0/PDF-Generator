import dotenv from "dotenv";
import process from "node:process";
import nodemailer from "nodemailer";
import * as console from "node:console";
import sgMailer from '@sendgrid/mail'
import {MailDataRequired} from "@sendgrid/helpers/classes/mail.js";

dotenv.config();
const GMAIL_USER: string | undefined = process.env.GMAIL_USER;
const GMAIL_APP_PASS: string | undefined = process.env.GMAIL_APP_PASS;
const SENDGRID_API_KEY: string | undefined = process.env.SENDGRID_API_KEY;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASS,
  },
});

interface MailOptionsInterface {
  from: string
  to: string
  subject: string
  text: string
  attachments: AttachmentInterface[]
}

interface AttachmentInterface {
  filename: string
  content: Buffer
  contentType: string
}

const mailOptions: MailOptionsInterface = {
  from: GMAIL_USER,
  to: undefined,
  subject: "Счёт на оплату услуг",
  text: "Здравствуйте! Ваш счет за оплату выполненных услуг в приложении.",
  attachments: [
    {
      filename: "invoice.pdf",
      content: undefined,
      contentType: "application/pdf",
    },
  ],
};

export default class MailSender {
  // Работает только при отправке с проверенного провайдера. Не работает, если отправлять через мобильную связь
  // или с использованием VPN
  static async sendPdfToClient(recipientEmail: string, pdfBuffer: Buffer) {
    mailOptions.to = recipientEmail;
    mailOptions.attachments[0].content = pdfBuffer;
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Письмо успешно отправлено: ", info.response);
    } catch (error) {
      throw error;
    }
  }

  // Работает только для daniilreservemail@gmail.com
  static async sendTestEmail(pdfBuffer: Buffer) {
    const mail: MailDataRequired = {
      to: GMAIL_USER,
      from: mailOptions.from,
      subject: mailOptions.subject,
      text: mailOptions.text,
      attachments: [
        {
          filename: mailOptions.attachments[0].filename,
          content: pdfBuffer.toString("base64"),
          type: mailOptions.attachments[0].contentType
        }
      ],
    };

    sgMailer.setApiKey(SENDGRID_API_KEY);

    try {
      await sgMailer.send(mail);
    } catch (error) {

      console.error('Ошибка при отправке письма через @sendgrid/mail:');
      if (error.response) {
        console.error('Тело ответа от SendGrid:', JSON.stringify(error.response.body, null, 2));
      } else {
        console.error(error);
      }
      throw error;
    }
  }
}
