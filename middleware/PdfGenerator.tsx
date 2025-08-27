import * as htmlToPdf from 'html-pdf-node';
import * as fs from 'fs';
import React from "react";
import PdfView from "../views/PdfView.js";
import { renderToStaticMarkup } from 'react-dom/server';
import * as path from "node:path";

export default class PdfGenerator {
    static async generatePdf(reactElement: React.ReactElement): Promise<void> {

        const htmlPage: string = renderToStaticMarkup(reactElement);

        const file = {
            content: htmlPage
        }

        const options = {
            format: 'A4',
            margin: {
                top: "20mm",
                right: "20mm",
                bottom: "20mm",
                left: "20mm"
            }
        };

        try {
            const pdfBuffer = await htmlToPdf.generatePdf(file, options);

            if (Buffer.isBuffer(pdfBuffer)) {
                fs.writeFileSync('invoice.pdf', pdfBuffer);
                console.log('PDF успешно создан: invoice.pdf');
            } else {
                console.error('Ошибка: html-pdf-node не вернул Buffer.', typeof pdfBuffer);
            }
        } catch (error) {
            console.error('Ошибка при создании PDF:', error);
            throw error;
        }
    }
}

// тесты

const client = {
    firstName: "Иван",
    lastName: "Иванов",
    companyName: "ООО Тестовая",
    email: "ivan.ivanov@example.com"
};

const invoice = {
    id: 666,
    email: "ivan.ivanov@example.com",
    createdAt: new Date().toISOString(),
    works: [
        { name: "Разработка логотипа", cost: 150 },
        { name: "Верстка главной страницы", cost: 200 },
        { name: "Настройка аналитики", cost: 750 }
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

await PdfGenerator.generatePdf(reactComponentWithProps);