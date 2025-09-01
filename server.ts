import express from "express";
import * as console from "node:console";
import DBController from "./middleware/DBController.js";
import { Invoice, InvoiceLog } from "./models/Invoice.js";
import QueueController, {
  redisConnection,
} from "./middleware/QueueController.js";
import { Client } from "./models/Client.js";
import process from "node:process";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "node:path";

dotenv.config();
const app = express();

const dbController = new DBController();

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Invoice Generation API",
      version: "1.0.0",
      description: "API для создания и отправки счетов на оплату.",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Локальный сервер для разработки",
      },
    ],
    components: {
      schemas: {},
    },
  },
  apis: [
    path.join(process.cwd(), "server.ts"),
    path.join(process.cwd(), "schemas/*.ts"),
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /test:
 *   get:
 *     tags:
 *       - Test
 *     summary: Послать тестовый запрос
 *     response:
 *       '200':
 *         description: Запрос успешно принят
 */
app.get("/test", (_req, res) => {
  res.sendStatus(200);
});
/**
 * @swagger
 * /api/invoice:
 *   post:
 *     tags:
 *       - Invoices
 *     summary: Создать и поставить в очередь задачу на генерацию счета
 *     description: |
 *       Принимает email клиента и список выполненных работ.
 *       1. Проверяет входные данные.
 *       2. Сохраняет информацию о счете в базу данных.
 *       3. Помещает задачу в очередь BullMQ для асинхронной генерации PDF-файла и отправки его по email.
 *     parameters:
 *     requestBody:
 *       description: Объект с данными для создания счета.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceRequest'
 *
 *     responses:
 *       '200':
 *         description: Запрос успешно принят, и задача на создание счета поставлена в очередь.
 *
 *       '500':
 *         description: |
 *           Произошла ошибка. Может быть два варианта:
 *           1. **Ошибка валидации:** Входные данные неполные (отсутствует email или список работ).
 *           2. **Внутренняя ошибка сервера:** Сбой при работе с базой данных, Redis или другой непредвиденный сбой.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *           examples:
 *             validationError:
 *               summary: Пример ошибки валидации
 *               value:
 *                 message: "Ошибка! Не все данные введены"
 *             internalError:
 *               summary: Пример внутренней ошибки
 *               value:
 *                 message: "Internal Server Error"
 */
app.post("/api/invoice", async (req, res) => {
  console.log("Обращение к серверу...");
  const reqInvoice: Invoice = req.body;
  if (!Invoice.validateInvoice(reqInvoice)) {
    res.status(500).send({ message: "Ошибка! Неверный формат входных данных" });
    return;
  }
  try {
    // 1: добавить лог в БД
    console.log("Начало проверки и добавления инвойса в лог");
    await dbController.checkEmailExistsAddInvoiceToLogs(reqInvoice);

    // 2: взять данные из логов
    console.log("Получение клинтов");
    const client: Client = await dbController.getClient(reqInvoice.email);
    const invoiceFromDb: InvoiceLog = await dbController.getInvoiceFromLogs(
      reqInvoice.email,
    );

    const invoice: Invoice = new Invoice(reqInvoice.email);
    invoice.works = JSON.parse(invoiceFromDb.works);
    invoice.id = invoiceFromDb.id;
    invoice.created_at = invoiceFromDb.created_at;

    console.log(client, invoice);

    // 3: добавить данные в очередь и обработать
    console.log("Начало добавления данных в очередь");
    const queueController = new QueueController(
      "pdf-generator",
      redisConnection,
    );
    await queueController.addDataToQueue({ client: client, invoice: invoice });
    res.sendStatus(200);
  } catch (error) {
    console.log("Вызывается обработчик ошибок сервера");
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/api/client", (_req, res) => {
  res.sendStatus(500);
});

app.listen(process.env.APP_PORT, async () => {
  await dbController.init();
  console.log("Сервер запущен на http://localhost:" + process.env.APP_PORT);
});
