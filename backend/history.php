<?php
/**
 * GET /history.php
 *
 * Returns every game the CURRENTLY LOGGED-IN user has played, newest
 * first. There is no way to pass in a different user's id — this
 * endpoint doesn't even look for one in the query string.
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// The ONLY source of "whose history is this" — never a query
// parameter, never anything else in the request.
$userId = require_login();

$stmt = $pdo->prepare(
    "SELECT id, difficulty, score, time_taken, result, hints_used, played_at
     FROM game_results
     WHERE user_id = ?
     ORDER BY played_at DESC
     LIMIT 200"
);
$stmt->execute([$userId]);
$rows = $stmt->fetchAll();

$history = array_map(static function ($row) {
    return [
        'id'         => (int) $row['id'],
        'difficulty' => $row['difficulty'],
        'result'     => $row['result'],
        'score'      => (int) $row['score'],
        'timeTaken'  => (int) $row['time_taken'],
        'hintsUsed'  => (int) $row['hints_used'],
        'playedAt'   => $row['played_at'],
    ];
}, $rows);

echo json_encode([
    'success' => true,
    'history' => $history,
]);
