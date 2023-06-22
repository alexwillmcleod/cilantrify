-- Add migration script here
CREATE TABLE sign_in_codes (
  id SERIAL PRIMARY KEY,
  user_id INT,
  FOREIGN KEY (user_id) references users(id),
  code INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes')
);