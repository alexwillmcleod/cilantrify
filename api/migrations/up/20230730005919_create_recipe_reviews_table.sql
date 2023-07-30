-- Add migration script here
CREATE TABLE recipe_reviews (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  author_id INT NOT NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  rating FLOAT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT 
);