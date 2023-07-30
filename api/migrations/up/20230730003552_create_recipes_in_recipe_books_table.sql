-- Add migration script here
CREATE TABLE recipes_in_recipe_books (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_book_id INT NOT NULL,
  FOREIGN KEY (recipe_book_id) REFERENCES recipe_books(id) ON DELETE CASCADE
);