CREATE TABLE account_action_context (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES account(id),
    action_name TEXT NOT NULL,
    context JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    disabled_at TIMESTAMPTZ
);