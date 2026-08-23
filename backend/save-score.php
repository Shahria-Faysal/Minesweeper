<?php
/**
 * POST /save-score.php
 * Body (JSON): { difficulty, score, time_taken, cells_revealed, hints_used }
 *
 * There is no win condition, so there is no "result" field — every
 * saved game just represents how far the player got (cells revealed
 * and time survived) before hitting a mine.
 *
 * SECURITY: the user is identified ONLY by $_SESSION['user_id'] —
 * never by anything in the request body. React never sends a
 * user_id, and even if it did, this file would ignore it.
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Ends the request with 401 if nobody is logged in. Otherwise this
// is the ONLY source of truth for "whose result is this."
$userId = require_login();

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$difficulty     = $input['difficulty'] ?? '';
$timeTaken      = $input['time_taken'] ?? null;
$cellsRevealed  = $input['cells_revealed'] ?? null;
$hintsUsed      = $input['hints_used'] ?? null;
// $input['score'] is intentionally never read for the INSERT below —
// see the "recompute the score" comment further down.

// ---- Validation -----------------------------------------------------

// Total safe (non-mine) cells per difficulty — this is the real
// ceiling for cells_revealed, taken straight from the board sizes in
// frontend/src/utils/minesweeper.js (DIFFICULTIES).
$safeCellCounts = [
    'beginner' => 9 * 9 - 10,   // 71
    'advanced' => 16 * 16 - 40, // 216
];
$maxHints          = 3;   // must match MAX_HINTS in frontend/src/utils/minesweeper.js
$maxReasonableTime = 24 * 60 * 60; // 24 hours — just a sanity ceiling, not a real limit

if (!array_key_exists($difficulty, $safeCellCounts)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid difficulty.']);
    exit;
}

if (!is_numeric($timeTaken) || (int) $timeTaken < 0 || (int) $timeTaken > $maxReasonableTime) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid time_taken.']);
    exit;
}

if (
    !is_numeric($cellsRevealed) ||
    (int) $cellsRevealed < 0 ||
    (int) $cellsRevealed > $safeCellCounts[$difficulty]
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid cells_revealed.']);
    exit;
}

if (!is_numeric($hintsUsed) || (int) $hintsUsed < 0 || (int) $hintsUsed > $maxHints) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid hints_used.']);
    exit;
}

$timeTaken     = (int) $timeTaken;
$cellsRevealed = (int) $cellsRevealed;
$hintsUsed     = (int) $hintsUsed;

// Recompute the score server-side using the exact same formula the
// frontend uses, instead of trusting whatever number was in the
// request body. Score rewards progress (cells revealed) and survival
// time, minus a penalty per hint. This makes an inflated/faked score
// (e.g. edited in devtools) impossible rather than just "detected."
$score = max(0, ($cellsRevealed * 10) + ($timeTaken * 2) - ($hintsUsed * 50));

// ---- Duplicate-submission guard --------------------------------------
//
// The frontend already stops itself from firing this request twice
// for the same finished game (see useMinesweeper's hasSavedRef). This
// is a second, server-side line of defense: if a request with the
// exact same outcome for this user arrives again within a few
// seconds — a retried fetch, a double click that raced past the
// frontend guard — it's rejected instead of inserted a second time.
$signature = md5("{$userId}|{$difficulty}|{$timeTaken}|{$cellsRevealed}|{$hintsUsed}");

if (
    isset($_SESSION['last_save_signature'], $_SESSION['last_save_at']) &&
    $_SESSION['last_save_signature'] === $signature &&
    (time() - $_SESSION['last_save_at']) < 10
) {
    http_response_code(409);
    echo json_encode([
        'success' => false,
        'message' => 'This result was already saved.',
    ]);
    exit;
}

// ---- Insert -----------------------------------------------------
// played_at is NOT sent by React — it defaults to CURRENT_TIMESTAMP
// in the database itself (see database/schema.sql).
$stmt = $pdo->prepare(
    'INSERT INTO game_results (user_id, difficulty, score, time_taken, cells_revealed, hints_used)
     VALUES (?, ?, ?, ?, ?, ?)'
);
$stmt->execute([$userId, $difficulty, $score, $timeTaken, $cellsRevealed, $hintsUsed]);

$_SESSION['last_save_signature'] = $signature;
$_SESSION['last_save_at']        = time();

echo json_encode([
    'success' => true,
    'message' => 'Game result saved',
]);
