CREATE TABLE account_token (
    token TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES account (id),
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX account_token_account_id_idx ON account_token (account_id);