-- Add migration script here
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  given_name VARCHAR(255) NOT NULL,
  family_name VARCHAR(255) NOT NULL,
  bio TEXT,
  picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);