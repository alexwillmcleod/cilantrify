-- Add migration script here
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  picture VARCHAR(255),
  instructions VARCHAR(255)[],
  author_id INT NOT NULL,
  FOREIGN KEY (author_id) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

