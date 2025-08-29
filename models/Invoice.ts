export interface Work {
  name: string;
  cost: number;
}

export interface InvoiceLog {
  id: number;
  client_id: number;
  total_amount: number;
  status: string;
  created_at: Date;
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
