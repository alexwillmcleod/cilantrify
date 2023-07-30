-- Add migration script here
CREATE TABLE recipes_in_categories (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  category_id INT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);