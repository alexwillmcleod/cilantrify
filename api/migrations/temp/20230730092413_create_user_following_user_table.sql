-- Add migration script here
CREATE TABLE users_following_users (
  id SERIAL PRIMARY KEY,
  following_user_id INT NOT NULL,
  FOREIGN KEY (following_user_id) REFERENCES users(id) ON DELETE CASCADE,
  followed_user_id INT NOT NULL,
  FOREIGN KEY (followed_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_follow_different_users CHECK (following_user_id <> followed_user_id)
)