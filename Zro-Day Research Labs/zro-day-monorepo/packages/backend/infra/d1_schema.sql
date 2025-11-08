-- =========================================================
-- Users table (core identity)
-- =========================================================
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,                  -- NULL if password-less only
  is_verified BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- Email verification tokens
-- =========================================================
CREATE TABLE email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- Password reset tokens
-- =========================================================
CREATE TABLE password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- Magic link (password-less login) tokens
-- =========================================================
CREATE TABLE magic_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- Indexes for faster lookups
-- =========================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_magic_links_token ON magic_links(token);
