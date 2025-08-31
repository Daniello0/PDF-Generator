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
}
