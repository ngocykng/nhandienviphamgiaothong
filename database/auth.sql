CREATE DATABASE IF NOT EXISTS viettraffic
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE viettraffic;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB;

-- Initial admin account; password is stored as a bcrypt hash.
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
