<?php

/**
 * Returns the logged-in user's id, or null if nobody is logged in.
 */
function current_user_id(): ?int
{
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}

/**
 * Stops the request with a 401 JSON response unless a session exists.
 * On success, returns the logged-in user's id so the caller can use it
 * directly, e.g.:
 *
 *     $userId = require_login();
 */
function require_login(): int
{
    $userId = current_user_id();

    if ($userId === null) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'You must be logged in to do that.',
        ]);
        exit;
    }

    return $userId;
}
