CREATE TABLE account_food_log (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES account (id),
    food_name TEXT NOT NULL,
    date DATE NOT NULL,
    proteing_gram FLOAT NOT NULL,
    fat_gram FLOAT NOT NULL,
    carb_gram FLOAT NOT NULL,
    calorie FLOAT NOT NULL
);

CREATE INDEX account_food_log_account_id_idx ON account_food_log (account_id);