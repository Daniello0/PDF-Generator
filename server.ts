import express, {json} from 'express';
import cookieParser from "cookie-parser";
import * as console from "node:console";
import DBController from "./middleware/DBController.js";
import {Invoice, InvoiceLog} from "./models/Invoice.js";
import QueueController, {redisConnection} from "./middleware/QueueController.js";
import {Client} from "./models/Client.js";

interface RawInvoiceFromDB {
    id: number;
    email: string;
    created_at: string;
    works: string;
}

const app = express();

const dbController = new DBController;

app.use(json());
app.use(cookieParser())

app.get('/test', (_req, res) => {
    res.send('Hello World');
});

app.post('/api/invoice', async (req, res) => {
    const dataset: Invoice = req.body;
    try {
        // 1: добавить лог в БД
        await dbController.checkEmailExistsAddInvoiceToLogs(dataset);

        // 2: взять данные из логов
        const client: Client = await dbController.getClient(dataset.email);
        const invoiceFromDb: InvoiceLog = await dbController.getInvoiceFromLogs(dataset.email);

        const invoice: Invoice = new Invoice(dataset.email);
        invoice.id = invoiceFromDb.id;
        invoice.works = JSON.parse(invoiceFromDb.works);

        console.log(client, invoice);

        // 3: добавить данные в очередь и обработать
        const queueController = new QueueController('pdf-generator', redisConnection);
        await queueController.addDataToQueue({client, invoice});

        // 4: закрыть очередь
        // await queueController.close();

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
    res.sendStatus(200);
});

app.post('/api/client', (req, res) => {
    res.sendStatus(500);
})

app.listen(3000, async () => {
    await dbController.init();
    console.log("Сервер запущен на http://localhost:3000");
});