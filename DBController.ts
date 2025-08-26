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

    constructor(params?: { sequelize?: Sequelize, url?: string }) {
        this.sequelize = params?.sequelize;
        this.url = params?.url;
    }

    create = async () => {
        dotenv.config();
        const DATABASE_URL: string | undefined = process.env.DATABASE_URL;

        try {
            let sequelize: Sequelize;
            if (!DATABASE_URL) {
                return;
            }
            sequelize = new Sequelize(DATABASE_URL);
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
            return new DBController({sequelize: sequelize, url: DATABASE_URL});
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            return new DBController();
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
            console.error(error);
            return;
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
            console.error(error);
            return;
        }
    }

    emailExistsInDB = async (email: string) => {
        email = email.trim();
        try {
            const client = await this.sequelize?.query(
                'SELECT * FROM public.clients WHERE email = :email',
                {
                    replacements: {email},
                    type: 'SELECT'
                }
            );
            return !!(client && client.length > 0);
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    addPdfToLogs = async (dataset: Dataset) => {
        try {
            const emailExists = await this.emailExistsInDB(dataset.email);
            if (!emailExists) {
                console.error('Email not found in DB: ', dataset.email);
                return;
            }
            await this.sequelize?.query(
                'INSERT INTO public.pdf_logs (email, invoices) VALUES (:email, :invoices)',
                {
                    replacements: {email: dataset.email, invoices: JSON.stringify(dataset.invoices)},
                    type: 'INSERT'
                });
        } catch (error) {
            console.error(error);
            return;
        }
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
            console.error(error);
            return;
        }
    }
}