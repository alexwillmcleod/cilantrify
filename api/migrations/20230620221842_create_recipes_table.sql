-- Add migration script here
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions VARCHAR(255)[],
  ingredients INT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

