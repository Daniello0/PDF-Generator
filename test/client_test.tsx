import { Invoice } from "../models/Invoice.js";
import axios from "axios";
import * as console from "node:console";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

const api = axios.create({
  baseURL: "http://localhost:"+process.env.APP_PORT,
});

async function testPostRequest() {
  const dataset = new Invoice("daniilreservemail@gmail.com");
  dataset.addInvoice("Работа 1", 100);
  dataset.addInvoice("Работа 2", 200);
  dataset.addInvoice("Скидка", -30);

  console.log(JSON.stringify(dataset, null, 2));

  const res = await api.post("/api/invoice", dataset);
  if (res) {
    console.log(res.status);
  }
}

// ТЕСТЫ
await testPostRequest();
