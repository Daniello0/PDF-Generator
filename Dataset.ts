export default class Dataset {
    email: string = "";
    invoices: object[] = [];

    constructor(email: string) {
        this.email = email;
    }

    addInvoice(work: string, coast: number) {
        this.invoices.push({work, coast});
    };
}