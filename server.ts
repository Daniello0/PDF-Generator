import express, {json} from 'express';
import cookieParser from "cookie-parser";
import * as console from "node:console";
import DBController from "./DBController.js";
import Dataset from "./Dataset.js";

const app = express();

const dbController = new DBController;

app.use(json());
app.use(cookieParser())

app.get('/test', (_req, res) => {
    res.send('Hello World');
});

app.post('/api/post', async (req, res) => {
    const dataset: Dataset = req.body;
    console.log(dataset.email + " ON SERVER");
    try {
        console.log(await dbController.emailExistsInDB(dataset.email));
        await dbController.addPdfToLogs(dataset);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
    res.sendStatus(200);
});

app.listen(3000, async () => {
    await dbController.init();
    console.log("Сервер запущен на http://localhost:3000");
});