<?php
/**
 * GET /leaderboard.php?difficulty=all|beginner|advanced
 *
 * Returns the top 10 scores, joined against `users` so we can show a
 * username instead of a raw user_id — and nothing else about that
 * user (no email, no password, no id).
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

// Only WINS are ranked. The score formula (1000 - time*5 - hints*50)
// doesn't know or care whether a game was won or lost, so if losses
// were included, someone could top the leaderboard by clicking a
// mine on their very first move (score 1000, time 0). Restricting to
// wins keeps "leaderboard" meaning what it should: best completed
// games.
$sql = "SELECT u.username, gr.difficulty, gr.score, gr.time_taken
        FROM game_results gr
        INNER JOIN users u ON gr.user_id = u.id
        WHERE gr.result = 'win'";

$params = [];
if ($difficultyFilter !== 'all') {
    $sql .= ' AND gr.difficulty = ?';
    $params[] = $difficultyFilter;
}

// Highest score first; ties broken by whoever was faster.
$sql .= ' ORDER BY gr.score DESC, gr.time_taken ASC LIMIT 10';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$leaderboard = [];
$rank = 1;
foreach ($rows as $row) {
    $leaderboard[] = [
        'rank'       => $rank,
        'username'   => $row['username'],
        'difficulty' => $row['difficulty'],
        'score'      => (int) $row['score'],
        'timeTaken'  => (int) $row['time_taken'],
    ];
    $rank++;
}

echo json_encode([
    'success'     => true,
    'leaderboard' => $leaderboard,
]);
