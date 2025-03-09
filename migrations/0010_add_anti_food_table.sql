CREATE TABLE anti_food (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE INDEX ON anti_food (name);