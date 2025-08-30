import express, { json } from "express";
import cookieParser from "cookie-parser";
import * as console from "node:console";
import DBController from "./middleware/DBController.js";
import { Invoice, InvoiceLog } from "./models/Invoice.js";
import QueueController, {
  redisConnection,
} from "./middleware/QueueController.js";
import { Client } from "./models/Client.js";
import process from "node:process";
import dotenv from "dotenv";
import cors from 'cors'

dotenv.config();
const app = express();

const dbController = new DBController();

app.use(json());
app.use(cookieParser());
app.use(cors())

app.get("/test", (_req, res) => {
  res.send("Hello World");
});

app.post("/api/invoice", async (req, res) => {
  const dataset: Invoice = req.body;
  try {
    // 1: добавить лог в БД
    await dbController.checkEmailExistsAddInvoiceToLogs(dataset);

    // 2: взять данные из логов
    const client: Client = await dbController.getClient(dataset.email);
    const invoiceFromDb: InvoiceLog = await dbController.getInvoiceFromLogs(
      dataset.email,
    );

    const invoice: Invoice = new Invoice(dataset.email);
    invoice.works = JSON.parse(invoiceFromDb.works);
    invoice.id = invoiceFromDb.id;
    invoice.created_at = invoiceFromDb.created_at;

    console.log(client, invoice);

    // 3: добавить данные в очередь и обработать
    const queueController = new QueueController(
      "pdf-generator",
      redisConnection,
    );
    await queueController.addDataToQueue({ client: client, invoice: invoice });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.post("/api/client", (_req, res) => {
  res.sendStatus(500);
});

app.listen(process.env.APP_PORT, async () => {
  await dbController.init();
  console.log("Сервер запущен на http://localhost:3000");
});
