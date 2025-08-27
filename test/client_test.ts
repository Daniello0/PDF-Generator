import {Invoice} from "../models/Invoice.js";
import axios from "axios";
import * as console from "node:console";

const api = axios.create({
    baseURL: 'http://localhost:3000'
});

async function testAddPdfToLogs() {
    const dataset = new Invoice('test_email@grsu.byuuu');
    dataset.addInvoice('work1', 100);
    dataset.addInvoice('work2', 200);

    console.log(JSON.stringify(dataset, null, 2));

    const res = await api.post('/api/post', dataset);
    if (res) {
        console.log(res.status);
    }
}

await testAddPdfToLogs();
