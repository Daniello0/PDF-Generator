import {Client} from "../models/Client.js";
import {Invoice} from "../models/Invoice.js";
import path from "node:path";
import React from 'react'
import fs from "fs";
import PdfGenerator from "./PdfGenerator.js";
import MailSender from "./MailSender.js";
import PdfView from "../views/PdfView.js";

export default class Factory {
    static async generateAndSendPdfToClient({client, invoice}: {client: Client, invoice: Invoice}) {
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
}