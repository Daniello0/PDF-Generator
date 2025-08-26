import express, {json} from 'express';
import cookieParser from "cookie-parser";
import * as console from "node:console";
import axios from 'axios'
import Dataset from "./Dataset.js";

const app = express();
const api = axios.create({
    baseURL: 'http://localhost:3000'
});

app.use(json());
app.use(cookieParser())

app.get('/test', (req, res) => {
    res.send('Hello World');
});

app.post('/api/post', (req, res) => {
    const {email, invoices} = req.body;
    res.send(JSON.stringify({email, invoices}, null, 2));
})

app.listen(3000, async () => {
    console.log("Сервер запущен на http://localhost:3000");
    await test();
    await postTest();
});

async function test() {
    const res = await api.get('/test');
    if (res) console.log(res.data);
}

async function postTest() {
    const dataset = new Dataset('test@eamil.com');
    dataset.addInvoice('work1', 100);
    dataset.addInvoice('work2', 200);
    const res = await api.post('/api/post', dataset);
    if (res) {
        console.log(res.data);
    }
}