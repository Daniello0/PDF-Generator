CREATE TABLE IF NOT EXISTS clients (
    id           BIGSERIAL PRIMARY KEY,
    first_name   TEXT NOT NULL,
    last_name    TEXT NOT NULL,
    company_name TEXT,
    email        TEXT NOT NULL UNIQUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_logs (
    id           BIGSERIAL PRIMARY KEY,
    email        TEXT NOT NULL UNIQUE,
    works        TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO clients (first_name, last_name, company_name, email)
VALUES ('Даниил', 'Киселевский', 'Daniil Inc', 'daniilreservemail@gmail.com')
ON CONFLICT (email) DO NOTHING;