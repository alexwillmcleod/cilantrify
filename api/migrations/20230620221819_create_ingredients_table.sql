-- Add migration script here
CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  unit measurement_unit NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);