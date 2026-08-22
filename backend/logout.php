<?php
/**
 * POST /logout.php
 * Destroys the current PHP session (server-side data + the cookie).
 */

require_once __DIR__ . '/config/cors.php';

// Clear all session data.
$_SESSION = [];

// Also expire the session cookie itself in the browser.
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

session_destroy();

echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully',
]);
