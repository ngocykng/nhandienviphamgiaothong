-- Run once on an existing database whose users table was created from the old auth.sql.
ALTER TABLE users
  ADD COLUMN role ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen' AFTER password_hash;

-- Creates the requested admin account or promotes/resets it if the account already exists.
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
  'Quản trị viên',
  'admin@123',
  '$2b$12$SQOSTim227ju2g7frsBquONDM6HkZWfUwm6owOAg5MQsAoewyjk2q',
  'admin'
)
ON DUPLICATE KEY UPDATE
  full_name = 'Quản trị viên',
  password_hash = '$2b$12$SQOSTim227ju2g7frsBquONDM6HkZWfUwm6owOAg5MQsAoewyjk2q',
  role = 'admin';
