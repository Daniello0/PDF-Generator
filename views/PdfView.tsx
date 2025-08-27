import React from 'react';
import {Client} from "../models/Client.js";
import {Invoice} from "../models/Invoice.js";



export default function PdfView({client, invoice}: { client: Client, invoice: Invoice }) {
    return (
        <div className="main">
            <div className="header">
                <h1>Счёт за услуги</h1>
            </div>

            <div className="invoice-id">
                <h3>Счёт #{invoice.id}</h3><br/>
                {invoice.createdAt}
            </div>

            <div className="client">
                <h3>Клиент</h3><br/>
                {client.firstName} {client.lastName}<br/>
                {client.email}
                {client.companyName}
            </div>

            <div className="works">
                <h3>Стоимость услуг</h3>
                {invoice.works.map(work => {
                    return (
                        <div className="work" key={work.name}>
                            <b className="work-name">{work.name}</b>
                            <b className="work-price">{work.cost}$</b>
                        </div>
                    )
                })}
            </div>

            <div className="total-cost">
                <h2 className="total-cost-sum">Сумма</h2>
                <h2 className="total-cost-number">{invoice.works.reduce((sum, work) => sum + work.cost, 0)}</h2>
            </div>

        </div>
    );
}