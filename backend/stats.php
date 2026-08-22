<?php
/**
 * GET /stats.php?difficulty=all|beginner|advanced
 *
 * Personal statistics for the CURRENTLY LOGGED-IN user only.
 *
 * Design choice: "highest score" and "best time" only count WINS.
 * The score formula doesn't distinguish a win from a loss, so a
 * quick loss could otherwise look like someone's "best" game, which
 * doesn't make sense. Games Played / Won / Lost / Average Score
 * count everything, since those are meant to describe overall
 * activity, not just your best moments.
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

// ---- Overall counts + average (every game counts) ------------------

$sql = "SELECT
            COUNT(*) AS games_played,
            SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) AS games_won,
            SUM(CASE WHEN result = 'lose' THEN 1 ELSE 0 END) AS games_lost,
            AVG(score) AS average_score
        FROM game_results
        WHERE user_id = ?" . $difficultyClause;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$summary = $stmt->fetch();

$gamesPlayed  = (int) $summary['games_played'];
$gamesWon     = (int) $summary['games_won'];
$gamesLost    = (int) $summary['games_lost'];
$averageScore = $summary['average_score'] !== null ? round((float) $summary['average_score'], 1) : 0;
$winRate      = $gamesPlayed > 0 ? round(($gamesWon / $gamesPlayed) * 100, 1) : 0;

// ---- Highest score / best time (wins only) ---------------------------

$sql = "SELECT MAX(score) AS highest_score, MIN(time_taken) AS best_time
        FROM game_results
        WHERE user_id = ? AND result = 'win'" . $difficultyClause;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$bestRow = $stmt->fetch();

$highestScore = $bestRow['highest_score'] !== null ? (int) $bestRow['highest_score'] : null;
$bestTime     = $bestRow['best_time'] !== null ? (int) $bestRow['best_time'] : null;

// ---- Win streaks -----------------------------------------------------
// Streaks are sequential (depend on game ORDER), not a single
// aggregate value, so there's no one SQL function for this. Instead:
// fetch results oldest-first and walk them once in PHP.

$sql = "SELECT result FROM game_results
        WHERE user_id = ?" . $difficultyClause . "
        ORDER BY played_at ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$orderedResults = $stmt->fetchAll(PDO::FETCH_COLUMN);

$bestStreak = 0;
$runningStreak = 0;
foreach ($orderedResults as $result) {
    if ($result === 'win') {
        $runningStreak++;
        $bestStreak = max($bestStreak, $runningStreak);
    } else {
        $runningStreak = 0;
    }
}

// Current streak = trailing wins at the very end of the list (the
// most recent games), counting backwards until the first loss.
$currentStreak = 0;
for ($i = count($orderedResults) - 1; $i >= 0; $i--) {
    if ($orderedResults[$i] === 'win') {
        $currentStreak++;
    } else {
        break;
    }
}

echo json_encode([
    'success' => true,
    'stats' => [
        'difficulty'    => $difficultyFilter,
        'gamesPlayed'   => $gamesPlayed,
        'gamesWon'      => $gamesWon,
        'gamesLost'     => $gamesLost,
        'winRate'       => $winRate,
        'highestScore'  => $highestScore,
        'bestTime'      => $bestTime,
        'averageScore'  => $averageScore,
        'currentStreak' => $currentStreak,
        'bestStreak'    => $bestStreak,
    ],
]);
