<?php
/**
 * GET /leaderboard.php?difficulty=all|beginner|advanced
 *
 * Returns the top 10 scores across ALL games — there is no win
 * condition, so nothing is filtered by outcome. Joined against
 * `users` so we can show a username instead of a raw user_id — and
 * nothing else about that user (no email, no password, no id).
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Leaderboard data isn't private, but every other page in this app
// requires login, so this endpoint stays consistent with that.
require_login();

$validDifficulties = ['beginner', 'advanced'];
$difficultyFilter = $_GET['difficulty'] ?? 'all';

if ($difficultyFilter !== 'all' && !in_array($difficultyFilter, $validDifficulties, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid difficulty filter.']);
    exit;
}

$sql = "SELECT u.username, gr.difficulty, gr.score, gr.time_taken, gr.cells_revealed, gr.hints_used
        FROM game_results gr
        INNER JOIN users u ON gr.user_id = u.id";

$params = [];
if ($difficultyFilter !== 'all') {
    $sql .= ' WHERE gr.difficulty = ?';
    $params[] = $difficultyFilter;
}

// Highest score first; ties broken by whoever revealed more cells.
$sql .= ' ORDER BY gr.score DESC, gr.cells_revealed DESC LIMIT 10';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$leaderboard = [];
$rank = 1;
foreach ($rows as $row) {
    $leaderboard[] = [
        'rank'          => $rank,
        'username'      => $row['username'],
        'difficulty'    => $row['difficulty'],
        'score'         => (int) $row['score'],
        'timeTaken'     => (int) $row['time_taken'],
        'cellsRevealed' => (int) $row['cells_revealed'],
        'hintsUsed'     => (int) $row['hints_used'],
    ];
    $rank++;
}

echo json_encode([
    'success'     => true,
    'leaderboard' => $leaderboard,
]);
