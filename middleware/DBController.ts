import {Sequelize} from "sequelize";
import * as dotenv from 'dotenv';
import * as console from "node:console";
import {Invoice, InvoiceLog} from "../models/Invoice.js";
import {Client} from "../models/Client.js";

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

    async getClient(email: string): Promise<Client | null> { // <-- Изменили на Client | null
        email = email.trim();
        if (!this.sequelize) {
            throw new Error("Соединение с БД не установлено (sequelize is undefined).");
        }

        try {
            return await this.sequelize.query<Client>(
                'SELECT * FROM public.clients WHERE email = :email LIMIT 1;', // LIMIT 1 здесь тоже важен
                {
                    replacements: {email},
                    type: 'SELECT',
                    plain: true,
                }
            );

        } catch (error) {
            console.error(`Ошибка при получении клиента с email ${email}:`, error);
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

    checkEmailExistsAddInvoiceToLogs = async (invoice: Invoice) => {
        invoice.email = invoice.email.trim();
        const emailExists = await this.emailExistsInDB(invoice.email);
        if (!emailExists) {
            console.error('Email не найден в БД: ', invoice.email);
            throw new Error('Email не найден в БД: ' + invoice.email);
        }
        await this.sequelize?.query(
            'INSERT INTO public.invoice_logs (email, works) VALUES (:email, :invoices)',
            {
                replacements: {email: invoice.email, invoices: JSON.stringify(invoice.works)},
                type: 'INSERT'
            });
    }

    removeInvoiceFromLogs = async (email: string) => {
        email = email.trim();
        try {
            await this.sequelize?.query(
                'DELETE FROM public.invoice_logs WHERE email = :email',
                {
                    replacements: {email},
                    type: 'DELETE'
                }
            )
        } catch (error) {
            throw error;
        }
    }

    async getInvoiceFromLogs(email: string): Promise<InvoiceLog[]> {
        email = email.trim();
        if (!this.sequelize) {
            throw new Error("Соединение с БД не установлено (sequelize is undefined).");
        }

        try {
            return await this.sequelize.query<InvoiceLog>(
                `SELECT * FROM public.invoice_logs WHERE c.email = :email;`,
                {
                    replacements: {email},
                    plain: true,
                    type: 'SELECT',
                }
            );
        } catch (error) {
            console.error(`Ошибка при получении логов для email ${email}:`, error);
            throw error;
        }
    }
}