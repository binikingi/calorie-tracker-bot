CREATE TABLE food_dictionary (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    proteing_gram FLOAT NOT NULL,
    fat_gram FLOAT NOT NULL,
    carb_gram FLOAT NOT NULL,
    calorie FLOAT NOT NULL
);