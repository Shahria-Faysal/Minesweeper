<?php
/**
 * Database connection for the Minesweeper backend.
 *
 * Uses PDO with prepared statements. This file only opens the
 * connection — it does not contain any endpoint logic.
 *
 * Any script that needs the database should do:
 *     require_once __DIR__ . '/config/db.php';
 * and then use the $pdo variable.
 */

$DB_HOST = 'localhost';
$DB_NAME = 'minesweeper_db';
$DB_USER = 'root';
$DB_PASS = ''; // Default XAMPP MySQL password is empty

try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage(),
    ]));
}
