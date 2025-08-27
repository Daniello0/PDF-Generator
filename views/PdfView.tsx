import React from 'react';
import {Client} from "../models/Client.js";
import {Invoice} from "../models/Invoice.js";

export default function PdfView({client, invoice, styles}: { client: Client, invoice: Invoice, styles: string }) {
    let formattedDate: string = invoice.createdAt || "";
    if (invoice.createdAt) {
        formattedDate = new Date(invoice.createdAt).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <style>{styles}</style>
                <title></title>
            </head>
            <body>
            <div className="main">
                <div className="header">
                    <h1>Счёт за услуги</h1>
                </div>

                <div className="invoice-details">
                    <div className="invoice-id">
                        <h3>Счёт #{invoice.id}</h3>
                        <p>{formattedDate}</p>
                    </div>

                    <div className="client">
                        <h3>Клиент</h3>
                        <p>{client.firstName} {client.lastName}</p>
                        <p>{client.companyName}</p>
                        <p>{client.email}</p>
                    </div>
                </div>

                <div className="works">
                    <h3>Выполненные работы</h3>
                    <div className="works-header">
                        <span>Описание</span>
                        <span>Стоимость</span>
                    </div>
                    {invoice.works.map((work, index) => (
                        <div className="work" key={index}>
                            <span className="work-name">{work.name}</span>
                            <span className="work-price">{work.cost.toLocaleString('ru-RU')} $</span>
                        </div>
                    ))}
                </div>

                <div className="total-coast">
                    <span className="total-coast-label">Итого к оплате</span>
                    <span className="total-coast-number">
                    {invoice.works.reduce((sum, work) => sum + work.cost, 0).toLocaleString('ru-RU')} $
                </span>
                </div>
            </div>
            </body>
        </html>
    );
}