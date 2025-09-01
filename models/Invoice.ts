import validator from "validator";
import * as console from "node:console";

export interface Work {
  name: string;
  cost: number;
}

export interface InvoiceLog {
  id: number;
  created_at: Date;
  email: string;
  works: string;
}

export interface PlainInvoice {
  email: any;
  works: any[];
}

export class Invoice {
  id?: number;
  created_at?: Date;
  email: string = "";
  works: Work[] = [];

  constructor(email: string) {
    this.email = email;
  }

  addInvoice(work: string, cost: number) {
    this.works.push({ name: work, cost: cost });
  }

  static validateInvoice = (invoice: PlainInvoice): boolean => {
    console.log("Валидация данных...");

    if (!invoice || typeof invoice !== 'object') return false;
    if (typeof invoice.email !== 'string' || !validator.isEmail(invoice.email)) return false;
    if (!Array.isArray(invoice.works) || invoice.works.length === 0) return false;

    for (const work of invoice.works) {
      if (!work || typeof work !== 'object') return false;
      if (typeof work.name !== 'string' || work.name.trim().length === 0) return false;
      if (typeof work.cost !== 'number') return false;
    }

    return true;
  }
}
