import express, {json} from 'express';
import cookieParser from "cookie-parser";
import * as console from "node:console";

const app = express();

app.use(json);
app.use(cookieParser())

app.get('/test', (req, res) => {
    res.send('Hello World');
    console.log('Hello World in server');
});

app.listen(3000, () => {
    console.log("Сервер запущен на http://localhost:3000");
});