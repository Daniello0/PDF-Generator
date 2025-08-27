export interface Work {
    name: string;
    cost: number;
}

export class Invoice {
    id?: number;
    createdAt?: string;
    email: string = "";
    works: Work[] = [];

    constructor(email: string) {
        this.email = email;
    }

    addInvoice(work: string, cost: number) {
        this.works.push({name: work, cost: cost});
    };
}