import { Client } from "../models/Client.js";
import { Invoice } from "../models/Invoice.js";
import path from "node:path";
import React from "react";
import fs from "fs";
import PdfGenerator from "./PdfGenerator.js";
import MailSender from "./MailSender.js";
import PdfView from "../views/PdfView.js";
import * as console from "node:console";

export default class Factory {
  static async generateAndSendPdfToClient({
    client,
    invoice,
  }: {
    client: Client;
    invoice: Invoice;
  }) {
    try {
      const cssString = this.getCssString("./views/PdfView.css");

      const reactComponentWithProps = (
        <PdfView invoice={invoice} client={client} styles={cssString} />
      );

      const pdfBuffer: Buffer = await PdfGenerator.generateInvoicePdf(
        reactComponentWithProps,
      );

      // await MailSender.sendPdfToClient(client.email, pdfBuffer);
      await MailSender.sendTestEmail(pdfBuffer);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static getCssString(filepath: string) {
    try {
      const cssFilePath = path.resolve(process.cwd(), filepath);
      return fs.readFileSync(cssFilePath, "utf8");
    } catch (error) {
      throw error;
    }
  }
}
