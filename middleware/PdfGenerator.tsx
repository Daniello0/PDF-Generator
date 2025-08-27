import * as htmlToPdf from 'html-pdf-node';
import * as fs from 'fs';
import React from "react";
import PdfView from "../views/PdfView.js";
// @ts-ignore импортирует
import { renderToStaticMarkup } from 'react-dom/server.js';

export default class PdfGenerator {
    static async generatePdf(Component: React.ReactElement): Promise<void> {

        const htmlPage: string = renderToStaticMarkup(Component);

        const file = {
            content: htmlPage
        }

        const options = {
            format: 'A4',
        };

        const testFile = {
            content: '<div>Hello World from PDF!</div>',
        };

        try {
            const pdfBuffer = await htmlToPdf.generatePdf(file, options);

            if (Buffer.isBuffer(pdfBuffer)) {
                fs.writeFileSync('invoice.pdf', pdfBuffer);
                console.log('PDF успешно создан');
            } else {
                console.error('Ожидался Buffer: ', typeof pdfBuffer);
            }
        } catch (error) {
            console.error('Ошибка при создании PDF: ', error);
            throw error;
        }
    }
}

await PdfGenerator.generatePdf(PdfView({
    client: {
        firstName: "test",
        lastName: "testerson",
        companyName: "Company Inc",
        email: "test@email.com"
    },
    invoice: {
        id: 666,
        email: "test@email.com",
        createdAt: "06.01.2006 18:34",
        works: [
            {name: "Работа 1", cost: 300},
            {name: "Работа 2", cost: 500},
            {name: "Работа 3", cost: 178}
        ],
        addInvoice: function (work: string, cost: number): void {
            this.works.push({name: work, cost: cost});
        }
    }
}));
