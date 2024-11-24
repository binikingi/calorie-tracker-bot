CREATE TABLE message_log (
    id SERIAL PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    direction TEXT NOT NULL,
    body TEXT NOT NULL
);