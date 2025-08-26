import {Sequelize} from "sequelize";
import * as dotenv from 'dotenv';
import * as console from "node:console";

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
        await this.sequelize?.query(
            'INSERT INTO public.clients (first_name, last_name, company_name, email) VALUES (:first_name, :last_name, :company_name, :email)',
            {
                replacements: {first_name, last_name, company_name, email},
                type: 'INSERT'
            });
    }
}

const dbController = await new DBController().create();
dbController?.addClient({
    first_name: "test",
    last_name: "testerson",
    company_name: "testing",
    email: "test@email.com_second"
}).then(r => {
    console.log(r);
});