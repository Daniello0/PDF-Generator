import * as htmlToPdf from "html-pdf-node";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

export default class PdfGenerator {
  static async generatePdf(reactElement: React.ReactElement): Promise<Buffer> {
    const htmlPage: string = renderToStaticMarkup(reactElement);

    const file = {
      content: htmlPage,
    };

    const options = {
      format: "A4",
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    };

    try {
      const pdfBuffer = await htmlToPdf.generatePdf(file, options);

      if (Buffer.isBuffer(pdfBuffer)) {
        console.log("PDF успешно создан: invoice.pdf");
        return pdfBuffer;
      } else {
        console.error(
          "Ошибка: html-pdf-node не вернул Buffer.",
          typeof pdfBuffer,
        );
        throw new Error("Ошибка: html-pdf-node не вернул Buffer.");
      }
    } catch (error) {
      console.error("Ошибка при создании PDF:", error);
      throw error;
    }
  }
}
