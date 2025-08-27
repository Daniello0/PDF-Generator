import {Sequelize} from "sequelize";
import * as dotenv from 'dotenv';
import * as console from "node:console";
import Dataset from "./Dataset.js";

type addClientParams = {
    first_name: string,
    last_name: string,
    company_name: string,
    email: string
}

export default class DBController {
    sequelize: Sequelize | undefined;
    url: string | undefined;

    constructor(params?: { sequelize: Sequelize, url: string }) {
        this.sequelize = params?.sequelize;
        this.url = params?.url;
    }

    init = async () => {
        dotenv.config();
        const DATABASE_URL: string | undefined = process.env.DATABASE_URL;

        if (!DATABASE_URL) {
            console.error("DATABASE_URL не определен в .env файле");
            throw new Error("DATABASE_URL не прописан в конфигурации.");
        }

        try {
            const sequelize = new Sequelize(DATABASE_URL);
            await sequelize.authenticate();

            this.sequelize = sequelize;
            this.url = DATABASE_URL;

            console.log('Соединение с БД выполнено.');
        } catch (error) {
            console.error('Не удалось подключиться к БД: ', error);
            throw error;
        }
    }

    addClient = async ({first_name, last_name, company_name, email}: addClientParams) => {
        try {
            await this.sequelize?.query(
                'INSERT INTO public.clients (first_name, last_name, company_name, email) VALUES (:first_name, :last_name, :company_name, :email)',
                {
                    replacements: {first_name, last_name, company_name, email},
                    type: 'INSERT'
                });
        } catch (error) {
            throw error;
        }
    }

    removeClient = async (email: string) => {
        email = email.trim();
        try {
            await this.sequelize?.query(
                'DELETE FROM public.clients WHERE email = :email',
                {
                    replacements: {email},
                    type: 'DELETE'
                });
        } catch (error) {
            throw error;
        }
    }

    emailExistsInDB = async (email: string) => {
        email = email.trim();
        if (!this.sequelize) {
            throw new Error("Sequelize не инициализирован.");
        }
        const client = await this.sequelize.query(
            'SELECT * FROM public.clients WHERE email = :email',
            {
                replacements: {email},
                type: 'SELECT'
            });
        if (!client) {
            return false;
        } else {
            return (client.length > 0);
        }
    }

    addPdfToLogs = async (dataset: Dataset) => {
        dataset.email = dataset.email.trim();
        const emailExists = await this.emailExistsInDB(dataset.email);
        if (!emailExists) {
            console.error('Email не найден в БД: ', dataset.email);
            throw new Error('Email не найден в БД: ' + dataset.email);
        }
        await this.sequelize?.query(
            'INSERT INTO public.pdf_logs (email, invoices) VALUES (:email, :invoices)',
            {
                replacements: {email: dataset.email, invoices: JSON.stringify(dataset.invoices)},
                type: 'INSERT'
            });
    }

    removePdfFromLogs = async (email: string) => {
        email = email.trim();
        try {
            await this.sequelize?.query(
                'DELETE FROM public.pdf_logs WHERE email = :email',
                {
                    replacements: {email},
                    type: 'DELETE'
                }
            )
        } catch (error) {
            throw error;
        }
    }
}