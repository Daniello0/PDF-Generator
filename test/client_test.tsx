import {Invoice} from "../models/Invoice.js";
import axios from "axios";
import * as console from "node:console";
import path from "node:path";
import fs from "fs";
import PdfView from "../views/PdfView.js";
import PdfGenerator from "../middleware/PdfGenerator.js";
import React from "react";
import MailSender from "../middleware/MailSender.js";

const api = axios.create({
    baseURL: 'http://localhost:3000'
});

async function testAddPdfToLogs() {
    const dataset = new Invoice('test_email@grsu.byuuu');
    dataset.addInvoice('work1', 100);
    dataset.addInvoice('work2', 200);

    console.log(JSON.stringify(dataset, null, 2));

    const res = await api.post('/api/post', dataset);
    if (res) {
        console.log(res.status);
    }
}

async function sendMailToAddress(emailAddress: string) {
    const client = {
        firstName: "Иван",
        lastName: "Иванов",
        companyName: "Иванов Inc",
        email: emailAddress,
    };

    const invoice = {
        id: 1,
        email: emailAddress,
        createdAt: new Date().toISOString(),
        works: [
            { name: "Дизайн", cost: 300 },
            { name: "Обновления", cost: 150 },
            { name: "Скидка", cost: -50 }
        ],
        addInvoice: () => {
            throw Error("addInvoice не определен");
        }
    };

    const cssFilePath = path.resolve(process.cwd(), './views/PdfView.css');
    const cssString = fs.readFileSync(cssFilePath, 'utf8');

    const reactComponentWithProps = <PdfView
        invoice={invoice}
        client={client}
        styles={cssString}
    />;

    const pdfBuffer: Buffer = await PdfGenerator.generatePdf(reactComponentWithProps);
    await MailSender.sendPdfToClient(client.email, pdfBuffer);
}

// ТЕСТЫ
await sendMailToAddress('daniilreservemail@gmail.com');
