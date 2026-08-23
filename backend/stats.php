<?php
/**
 * GET /stats.php?difficulty=all|beginner|advanced
 *
 * Personal statistics for the CURRENTLY LOGGED-IN user only. There
 * is no win condition, so every game counts equally — nothing here
 * is filtered by outcome, and there's no win rate or win streak.
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// The ONLY source of "whose stats are these" — never anything from
// the request itself.
$userId = require_login();

$validDifficulties = ['beginner', 'advanced'];
$difficultyFilter = $_GET['difficulty'] ?? 'all';

if ($difficultyFilter !== 'all' && !in_array($difficultyFilter, $validDifficulties, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid difficulty filter.']);
    exit;
}

$hasDifficultyFilter = $difficultyFilter !== 'all';
$params = [$userId];
if ($hasDifficultyFilter) {
    $params[] = $difficultyFilter;
}
$difficultyClause = $hasDifficultyFilter ? ' AND difficulty = ?' : '';

$sql = "SELECT
            COUNT(*)             AS games_played,
            AVG(score)           AS average_score,
            MAX(score)           AS highest_score,
            MAX(time_taken)      AS longest_survival,
            MAX(cells_revealed)  AS most_cells_revealed
        FROM game_results
        WHERE user_id = ?" . $difficultyClause;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$summary = $stmt->fetch();

$gamesPlayed = (int) $summary['games_played'];

echo json_encode([
    'success' => true,
    'stats' => [
        'difficulty'         => $difficultyFilter,
        'gamesPlayed'        => $gamesPlayed,
        'averageScore'       => $summary['average_score'] !== null
            ? round((float) $summary['average_score'], 1)
            : 0,
        'highestScore'       => $summary['highest_score'] !== null ? (int) $summary['highest_score'] : null,
        'longestSurvival'    => $summary['longest_survival'] !== null ? (int) $summary['longest_survival'] : null,
        'mostCellsRevealed'  => $summary['most_cells_revealed'] !== null ? (int) $summary['most_cells_revealed'] : null,
    ],
]);
