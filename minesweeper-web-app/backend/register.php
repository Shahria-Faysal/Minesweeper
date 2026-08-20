<?php
/**
 * POST /register.php
 * Body (JSON): { username, email, password, confirm_password }
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$username        = trim($input['username'] ?? '');
$email           = trim($input['email'] ?? '');
$password        = (string) ($input['password'] ?? '');
$confirmPassword = (string) ($input['confirm_password'] ?? '');

// ---- Validate required fields --------------------------------------------
if ($username === '' || $email === '' || $password === '' || $confirmPassword === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (mb_strlen($username) < 3 || mb_strlen($username) > 50) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username must be between 3 and 50 characters.']);
    exit;
}

// ---- Validate email --------------------------------------------------
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// ---- Validate password --------------------------------------------------
if (mb_strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long.']);
    exit;
}

if ($password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
    exit;
}

// ---- Check email uniqueness --------------------------------------------
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email already exists.']);
    exit;
}

// ---- Check username uniqueness -------------------------------------------
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Username already exists.']);
    exit;
}

// ---- Create the user --------------------------------------------
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
);
$stmt->execute([$username, $email, $passwordHash]);

echo json_encode([
    'success' => true,
    'message' => 'Registration successful',
]);
