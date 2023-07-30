-- Add migration script here
CREATE TABLE recipe_books (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  author_id INT NOT NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  picture VARCHAR(255) NOT NULL
);