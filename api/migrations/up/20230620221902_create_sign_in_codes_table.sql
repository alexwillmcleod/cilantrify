-- Add migration script here
CREATE TABLE sign_in_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes')
);