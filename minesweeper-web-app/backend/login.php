<?php
/**
 * POST /login.php
 * Body (JSON): { email, password }
 *
 * On success, starts a PHP session and stores:
 *   $_SESSION['user_id']
 *   $_SESSION['username']
 * The session id is sent back to the browser as a cookie, which
 * React's fetch() calls must include on every future request
 * (credentials: "include") so PHP can recognize the same session.
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$email    = trim($input['email'] ?? '');
$password = (string) ($input['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, username, password FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Deliberately vague message — don't reveal whether the email exists.
if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    exit;
}

// Regenerate the session id on login (session fixation protection),
// then store identity in the session — never trust anything the
// client claims about who it is beyond this point.
session_regenerate_id(true);
$_SESSION['user_id']  = $user['id'];
$_SESSION['username'] = $user['username'];

echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'user' => [
        'id'       => $user['id'],
        'username' => $user['username'],
    ],
]);
