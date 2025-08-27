import * as htmlToPdf from 'html-pdf-node';
import * as fs from 'fs';

export default class PdfGenerator {
    static async generatePdf(): Promise<void> {

        const options = {
            format: 'A4',
        };

        const testFile = {
            content: '<div>Hello World from PDF!</div>',
        };

        try {
            const pdfBuffer = await htmlToPdf.generatePdf(testFile, options);

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

await PdfGenerator.generatePdf();
