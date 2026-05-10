CREATE TABLE if not exists users (
  user_id VARCHAR(255) PRIMARY KEY,
  username TEXT not NULL,
  email TEXT not NULL unique,
  hashed_password TEXT NOT NULL,
  save_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  completion_count INT DEFAULT 0,
  correct_completions INT DEFAULT 0
);


