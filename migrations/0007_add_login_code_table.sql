CREATE TABLE login_code (
    code TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES account (id),
    created_at TIMESTAMP NOT NULL
);