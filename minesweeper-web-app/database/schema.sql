-- Minesweeper Web Application
-- Database schema for Phase 1
--
-- Import this file in phpMyAdmin (or via `mysql -u root -p < schema.sql`)
-- to create the database and its tables.

CREATE DATABASE IF NOT EXISTS minesweeper_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE minesweeper_db;

-- ------------------------------------------------------
-- users
-- Stores registered player accounts.
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL,
    email      VARCHAR(100) NOT NULL,
    password   VARCHAR(255) NOT NULL,      -- stores a password_hash(), never plain text
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- game_results
-- Stores the outcome of every game a user plays.
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_results (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    difficulty  ENUM('beginner', 'advanced') NOT NULL,
    score       INT UNSIGNED NOT NULL DEFAULT 0,
    time_taken  INT UNSIGNED NOT NULL COMMENT 'seconds',
    result      ENUM('win', 'lose') NOT NULL,
    hints_used  INT UNSIGNED NOT NULL DEFAULT 0,
    played_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_game_results_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_game_results_user (user_id),
    INDEX idx_game_results_difficulty (difficulty)
) ENGINE=InnoDB;
