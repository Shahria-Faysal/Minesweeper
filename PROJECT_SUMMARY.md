# Minesweeper Web Application - Codebase & Project Summary

This document provides a comprehensive overview of the Minesweeper project, covering its architecture, database design, backend logic, and frontend components. It is structured to help ChatGPT or any external assistant fully understand the design decisions, data flow, and complete source code of the project.

---

## 📂 Project Structure

```text
Minesweeper/
├── database/
│   ├── schema.sql                              # Database initialization schema
│   └── migration-remove-win-condition.sql      # Database migration script (removed result column)
├── backend/
│   ├── config/
│   │   ├── db.php                              # Database connection helper
│   │   ├── cors.php                            # CORS setup + Session initialization
│   │   └── auth.php                            # Authentication helpers
│   ├── register.php                            # User registration endpoint
│   ├── login.php                               # User login endpoint (starts session)
│   ├── logout.php                              # User logout endpoint (destroys session)
│   ├── save-score.php                          # Saves game scores (validates & recomputes score)
│   ├── leaderboard.php                         # Fetch top 10 rankings across all games
│   ├── history.php                             # Fetch game logs for logged-in user
│   └── stats.php                               # Fetch aggregate user stats (games played, highest score, etc.)
├── frontend/
│   ├── .env.example                            # Vite env configuration sample
│   ├── index.html                              # Entry HTML document
│   ├── package.json                            # Package dependencies and run scripts
│   ├── vite.config.js                          # Vite bundler configuration
│   └── src/
│       ├── main.jsx                            # React app entry point
│       ├── App.jsx                             # Root App component and routing
│       ├── index.css                           # Core global styles (themes, variables)
│       ├── App.css                             # Layout and common component styles
│       ├── context/
│       │   ├── AuthContext.jsx                 # User context (local representation of session state)
│       │   ├── ThemeContext.jsx                # Light/Dark mode state and persistence
│       │   └── ToastContext.jsx                # Application-wide notifications and alerts
│       ├── hooks/
│       │   ├── useAuth.js                      # Helper hook for AuthContext
│       │   ├── useTheme.js                     # Helper hook for ThemeContext
│       │   ├── useCountUp.js                   # Smooth count-up animation helper for numbers
│       │   └── useMinesweeper.js               # Primary state and action driver for the Minesweeper board
│       ├── services/
│       │   ├── api.js                          # Fetch wrappers handling cookies and CORS preflighting
│       │   ├── authService.js                  # Auth API interaction layer
│       │   └── gameService.js                  # Game score / history / leaderboard / stats API layer
│       ├── utils/
│       │   └── minesweeper.js                  # Pure functional game logic (board generation, flood fill, chord, hints, scores)
│       ├── components/
│       │   ├── Cell.jsx                        # Individual board cell button
│       │   ├── MinesweeperBoard.jsx            # Grid wrapper rendering cells
│       │   ├── ResultModal.jsx                 # "Game Over" popup modal
│       │   ├── ThemeToggle.jsx                 # Light/Dark theme toggle button
│       │   ├── DifficultySelector.jsx          # Mode selector (Beginner vs. Advanced)
│       │   ├── FilterBar.jsx                   # Tabs filter (All vs. Beginner vs. Advanced)
│       │   └── ProtectedRoute.jsx              # Session validation Route guard
│       └── pages/
│           ├── Login.jsx                       # Login screen
│           ├── Register.jsx                    # Sign-up screen
│           ├── Game.jsx                        # Main game screen with shield panel, stats, and timer
│           ├── Dashboard.jsx                   # Personal statistics screen
│           ├── History.jsx                     # Past 200 game history logs
│           ├── Leaderboard.jsx                 # Global top-10 player ranks
│           └── Profile.jsx                     # Detailed user profile page
```

---

## 🗄️ Database Architecture

The application uses MySQL with InnoDB. The database keeps track of registered user accounts and their historical game attempts. Note that **there is no win/loss state** saved; every game is played until a mine is clicked or time runs out.

### 📄 Schema (`database/schema.sql`)

```sql
CREATE DATABASE IF NOT EXISTS minesweeper_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE minesweeper_db;

-- ------------------------------------------------------
-- users table: Stores registered player accounts.
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL,
    email      VARCHAR(100) NOT NULL,
    password   VARCHAR(255) NOT NULL,      -- Stores hashed passwords
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- game_results table: Stores played games.
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_results (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    difficulty      ENUM('beginner', 'advanced') NOT NULL,
    score           INT UNSIGNED NOT NULL DEFAULT 0,
    time_taken      INT UNSIGNED NOT NULL COMMENT 'seconds survived',
    cells_revealed  INT UNSIGNED NOT NULL DEFAULT 0,
    hints_used      INT UNSIGNED NOT NULL DEFAULT 0,
    played_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_game_results_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_game_results_user (user_id),
    INDEX idx_game_results_difficulty (difficulty)
) ENGINE=InnoDB;
```

### 📄 Migration (`database/migration-remove-win-condition.sql`)

Used to upgrade older database versions to support survival mode and drop the `result` columns.

```sql
USE minesweeper_db;

ALTER TABLE game_results
    ADD COLUMN cells_revealed INT UNSIGNED NOT NULL DEFAULT 0 AFTER time_taken;

ALTER TABLE game_results
    DROP COLUMN result;
```

---

## 🧠 Game Rules & Scoring System

1. **Survival Mode**: The game ends only when the player clicks a mine or when the 2-minute countdown timer runs out (`120` seconds). There is no "clear board" victory screen.
2. **First-Click Safety**: The first cell clicked and all of its immediate neighbors are guaranteed to be safe from mines. Mines are generated dynamically on the first reveal.
3. **Shield Ability**: Every game, the user gets **one shield**. Activating it blocks the next mine hit, leaving it unrevealed and allowing the player to continue.
4. **Hints**: A player has up to **3 hints** per game. Each hint highlights a random unrevealed safe cell for 3 seconds.
5. **Score Formula**:
   $$\text{score} = \max\left(0, (\text{cells\_revealed} \times 10) + (\text{time\_survived} \times 0) - (\text{hints\_used} \times 50)\right)$$
   *Note: Points per second is configured to 0 in `minesweeper.js` to prevent score auto-inflation by idling. The score relies on cell reveals and hint penalties.*
6. **Chording**: Clicking on an already revealed cell with a number matching the surrounding flag count will automatically reveal all non-flagged neighboring cells.

---

## 💻 Backend PHP Implementation

The PHP backend handles authorization and data persistence using session cookies (`PHPSESSID`) and PDO prepared statements.

### ⚙️ Backend Configurations

#### 📄 Database Connection (`backend/config/db.php`)
```php
<?php
$DB_HOST = 'localhost';
$DB_NAME = 'minesweeper_db';
$DB_USER = 'root';
$DB_PASS = ''; 

try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage(),
    ]));
}
```

#### 📄 CORS & Session Bootstrap (`backend/config/cors.php`)
```php
<?php
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
];

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($requestOrigin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$requestOrigin}");
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_set_cookie_params([
    'lifetime' => 0,          // Expires when browser closes
    'path'     => '/',
    'domain'   => 'localhost',
    'secure'   => false,      // Set to true in HTTPS production environments
    'httponly' => true,       // Prevents XSS script reading of cookie
    'samesite' => 'Lax',
]);

session_start();
header('Content-Type: application/json');
```

#### 📄 Authentication Helpers (`backend/config/auth.php`)
```php
<?php
function current_user_id(): ?int
{
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}

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
```

### 📡 API Endpoints

#### 📄 Registration (`backend/register.php`)
Handles new user registration, hashes passwords via `password_hash`, and enforces username/email uniqueness.
```php
<?php
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

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

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

// Check email uniqueness
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email already exists.']);
    exit;
}

// Check username uniqueness
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Username already exists.']);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
$stmt->execute([$username, $email, $passwordHash]);

echo json_encode(['success' => true, 'message' => 'Registration successful']);
```

#### 📄 Login (`backend/login.php`)
Validates user login credentials, regenerates session ID to prevent session fixation, and stores credentials in `$_SESSION`.
```php
<?php
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

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    exit;
}

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
```

#### 📄 Logout (`backend/logout.php`)
```php
<?php
require_once __DIR__ . '/config/cors.php';

$_SESSION = [];

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
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
```

#### 📄 Save Score (`backend/save-score.php`)
**Security Features**: Enforces `require_login()`. It **recomputes** the final score server-side based on submitted metrics (`cells_revealed`, `time_taken`, `hints_used`) to prevent client score tampering. It also has a signature duplication defense preventing double-submitting.
```php
<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$userId = require_login();
$input = json_decode(file_get_contents('php://input'), true) ?? [];

$difficulty     = $input['difficulty'] ?? '';
$timeTaken      = $input['time_taken'] ?? null;
$cellsRevealed  = $input['cells_revealed'] ?? null;
$hintsUsed      = $input['hints_used'] ?? null;

$safeCellCounts = [
    'beginner' => 9 * 9 - 10,   // 71
    'advanced' => 16 * 16 - 40, // 216
];
$maxHints          = 3;
$maxReasonableTime = 24 * 60 * 60;

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

if (!is_numeric($cellsRevealed) || (int) $cellsRevealed < 0 || (int) $cellsRevealed > $safeCellCounts[$difficulty]) {
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

// Score recalculation
$score = max(0, ($cellsRevealed * 10) + ($timeTaken * 0) - ($hintsUsed * 50));

// Double submission prevention signature
$signature = md5("{$userId}|{$difficulty}|{$timeTaken}|{$cellsRevealed}|{$hintsUsed}");

if (
    isset($_SESSION['last_save_signature'], $_SESSION['last_save_at']) &&
    $_SESSION['last_save_signature'] === $signature &&
    (time() - $_SESSION['last_save_at']) < 10
) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'This result was already saved.']);
    exit;
}

$stmt = $pdo->prepare(
    'INSERT INTO game_results (user_id, difficulty, score, time_taken, cells_revealed, hints_used)
     VALUES (?, ?, ?, ?, ?, ?)'
);
$stmt->execute([$userId, $difficulty, $score, $timeTaken, $cellsRevealed, $hintsUsed]);

$_SESSION['last_save_signature'] = $signature;
$_SESSION['last_save_at']        = time();

echo json_encode(['success' => true, 'message' => 'Game result saved']);
```

#### 📄 Leaderboard (`backend/leaderboard.php`)
Fetches top 10 rankings sorted by score descending, then cells revealed descending.
```php
<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

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

echo json_encode(['success' => true, 'leaderboard' => $leaderboard]);
```

#### 📄 Personal Statistics (`backend/stats.php`)
Aggregates user-specific metrics (high score, average score, most cells revealed).
```php
<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

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
        'averageScore'       => $summary['average_score'] !== null ? round((float) $summary['average_score'], 1) : 0,
        'highestScore'       => $summary['highest_score'] !== null ? (int) $summary['highest_score'] : null,
        'longestSurvival'    => $summary['longest_survival'] !== null ? (int) $summary['longest_survival'] : null,
        'mostCellsRevealed'  => $summary['most_cells_revealed'] !== null ? (int) $summary['most_cells_revealed'] : null,
    ],
]);
```

#### 📄 History (`backend/history.php`)
Fetches up to the 200 most recent games played by the user.
```php
<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$userId = require_login();

$stmt = $pdo->prepare(
    "SELECT id, difficulty, score, time_taken, cells_revealed, hints_used, played_at
     FROM game_results
     WHERE user_id = ?
     ORDER BY played_at DESC
     LIMIT 200"
);
$stmt->execute([$userId]);
$rows = $stmt->fetchAll();

$history = array_map(static function ($row) {
    return [
        'id'            => (int) $row['id'],
        'difficulty'    => $row['difficulty'],
        'score'         => (int) $row['score'],
        'timeTaken'     => (int) $row['time_taken'],
        'cellsRevealed' => (int) $row['cells_revealed'],
        'hintsUsed'     => (int) $row['hints_used'],
        'playedAt'      => $row['played_at'],
    ];
}, $rows);

echo json_encode(['success' => true, 'history' => $history]);
```

---

## 🎨 Frontend React Architecture

The frontend is a single-page application built on React, Vite, and React Router.

### ⚙️ Services & API Wrappers

#### 📄 Base Fetch Client (`frontend/src/services/api.js`)
Configured to pass session cookies to backend PHP using `credentials: "include"`.
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/backend";

export async function apiPost(endpoint, body) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
}

export async function apiGet(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/${endpoint}${query ? `?${query}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
}
```

### 🧠 Game Engine & Utilities

#### 📄 Functional Board Mathematics (`frontend/src/utils/minesweeper.js`)
Contains the algorithmic logic for building, generating, revealing, and scoring Minesweeper boards.
```javascript
export const DIFFICULTIES = {
  beginner: { label: "Beginner", rows: 9, cols: 9, mines: 10 },
  advanced: { label: "Advanced", rows: 16, cols: 16, mines: 40 },
};

export const MAX_HINTS = 3;
export const HINT_COST = 50;
export const HINT_HIGHLIGHT_MS = 3000;
export const POINTS_PER_CELL = 10;
export const POINTS_PER_SECOND = 0; 
export const TIME_LIMIT_SECONDS = 120; // 2 minutes

export function createEmptyBoard(rows, cols) {
  const board = [];
  for (let row = 0; row < rows; row++) {
    const rowCells = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push({
        row,
        col,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      });
    }
    board.push(rowCells);
  }
  return board;
}

export function getNeighbors(board, row, col) {
  const neighbors = [];
  for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
    for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
      if (deltaRow === 0 && deltaCol === 0) continue;
      const r = row + deltaRow;
      const c = col + deltaCol;
      if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
        neighbors.push(board[r][c]);
      }
    }
  }
  return neighbors;
}

export function placeMines(board, mineCount, safeRow, safeCol) {
  const rows = board.length;
  const cols = board[0].length;
  const safeCells = new Set([`${safeRow},${safeCol}`]);
  getNeighbors(board, safeRow, safeCol).forEach((cell) => {
    safeCells.add(`${cell.row},${cell.col}`);
  });

  const candidates = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!safeCells.has(`${row},${col}`)) {
        candidates.push([row, col]);
      }
    }
  }

  // Fisher-Yates Shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const mineCells = candidates.slice(0, mineCount);
  const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
  mineCells.forEach(([row, col]) => {
    newBoard[row][col].isMine = true;
  });

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (newBoard[row][col].isMine) continue;
      newBoard[row][col].adjacentMines = getNeighbors(newBoard, row, col).filter(
        (cell) => cell.isMine
      ).length;
    }
  }
  return newBoard;
}

// Iterative stack flood-reveal
export function revealCell(board, row, col) {
  const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
  const stack = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const cell = newBoard[r][c];

    if (cell.isRevealed || cell.isFlagged) continue;
    cell.isRevealed = true;

    if (cell.adjacentMines === 0 && !cell.isMine) {
      getNeighbors(newBoard, r, c).forEach((neighbor) => {
        if (!neighbor.isRevealed && !neighbor.isFlagged) {
          stack.push([neighbor.row, neighbor.col]);
        }
      });
    }
  }
  return newBoard;
}

export function revealAllMines(board) {
  return board.map((r) => r.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell)));
}

export function toggleFlag(board, row, col, mineCount) {
  const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
  const cell = newBoard[row][col];
  if (cell.isRevealed) return newBoard;

  if (cell.isFlagged) {
    cell.isFlagged = false;
  } else {
    if (countFlags(board) < mineCount) {
      cell.isFlagged = true;
    }
  }
  return newBoard;
}

export function countFlags(board) {
  return board.flat().filter((cell) => cell.isFlagged).length;
}

export function chordCell(board, row, col) {
  const cell = board[row][col];
  if (!cell.isRevealed || cell.adjacentMines === 0 || cell.isMine) {
    return board;
  }

  const neighbors = getNeighbors(board, row, col);
  const adjacentFlagCount = neighbors.filter((n) => n.isFlagged).length;

  if (adjacentFlagCount !== cell.adjacentMines) {
    return board;
  }

  let workingBoard = board;
  neighbors
    .filter((n) => !n.isFlagged && !n.isRevealed)
    .forEach((n) => {
      workingBoard = revealCell(workingBoard, n.row, n.col);
    });

  return workingBoard;
}

export function countRevealedSafeCells(board) {
  return board.flat().filter((cell) => cell.isRevealed && !cell.isMine).length;
}

export function findHintCell(board) {
  const candidates = board.flat().filter(
    (cell) => !cell.isMine && !cell.isRevealed && !cell.isFlagged
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function calculateScore(cellsRevealed, timeElapsed, hintsUsed) {
  const rawScore = cellsRevealed * POINTS_PER_CELL + timeElapsed * POINTS_PER_SECOND - hintsUsed * HINT_COST;
  return Math.max(0, rawScore);
}
```

### ⚡ Custom Core Hooks

#### 📄 Board Controller (`frontend/src/hooks/useMinesweeper.js`)
Coordinates time tracking, click handlers, shield usage, backend score-saving, and game restarts.
```javascript
import { useState, useEffect, useCallback, useRef } from "react";
import {
  DIFFICULTIES,
  MAX_HINTS,
  HINT_HIGHLIGHT_MS,
  createEmptyBoard,
  placeMines,
  revealCell,
  revealAllMines,
  toggleFlag,
  countFlags,
  countRevealedSafeCells,
  findHintCell,
  calculateScore,
  chordCell,
  TIME_LIMIT_SECONDS,
} from "../utils/minesweeper";
import { saveGameResult } from "../services/gameService";

export function useMinesweeper(initialDifficulty = "beginner") {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const config = DIFFICULTIES[difficulty];

  const [board, setBoard] = useState(() => createEmptyBoard(config.rows, config.cols));
  const [gameStatus, setGameStatus] = useState("ready");
  const [timeElapsed, setTimeElapsed] = useState(TIME_LIMIT_SECONDS);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintCell, setHintCell] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [shieldState, setShieldState] = useState("available"); // "available" | "active" | "used"

  const timerRef = useRef(null);
  const hintTimeoutRef = useRef(null);
  const hasSavedRef = useRef(false);

  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        setTimeElapsed((seconds) => {
          if (seconds <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStatus]);

  // Handle timeout game-over
  useEffect(() => {
    if (gameStatus === "playing" && timeElapsed === 0) {
      setBoard((prevBoard) => revealAllMines(prevBoard));
      setGameStatus("lost");
    }
  }, [timeElapsed, gameStatus]);

  useEffect(() => {
    return () => clearTimeout(hintTimeoutRef.current);
  }, []);

  // Sync to database
  useEffect(() => {
    if (gameStatus !== "lost") return;
    if (hasSavedRef.current) return;

    hasSavedRef.current = true;
    setSaveStatus("saving");

    const timeSpent = TIME_LIMIT_SECONDS - timeElapsed;

    saveGameResult({
      difficulty,
      score: calculateScore(countRevealedSafeCells(board), timeSpent, hintsUsed),
      timeTaken: timeSpent,
      cellsRevealed: countRevealedSafeCells(board),
      hintsUsed,
    })
      .then(() => setSaveStatus("saved"))
      .catch(() => setSaveStatus("error"));
  }, [gameStatus]);

  function clearHintHighlight() {
    clearTimeout(hintTimeoutRef.current);
    setHintCell(null);
  }

  const resetGame = useCallback((nextDifficulty) => {
    const targetDifficulty = nextDifficulty ?? difficulty;
    const targetConfig = DIFFICULTIES[targetDifficulty];

    clearTimeout(hintTimeoutRef.current);
    hasSavedRef.current = false;
    setHintCell(null);
    setSaveStatus("idle");
    setDifficulty(targetDifficulty);
    setBoard(createEmptyBoard(targetConfig.rows, targetConfig.cols));
    setGameStatus("ready");
    setTimeElapsed(TIME_LIMIT_SECONDS);
    setHintsUsed(0);
    setShieldState("available");
  }, [difficulty]);

  function revealCellAt(row, col) {
    if (gameStatus === "lost") return;

    const targetCell = board[row][col];
    if (targetCell.isRevealed || targetCell.isFlagged) return;

    clearHintHighlight();
    let workingBoard = board;

    if (gameStatus === "ready") {
      workingBoard = placeMines(board, config.mines, row, col);
      setGameStatus("playing");
    }

    if (workingBoard[row][col].isMine) {
      if (shieldState === "active") {
        setShieldState("used");
        if (gameStatus === "ready") {
          setBoard(workingBoard);
        }
        return;
      }
      setBoard(revealAllMines(revealCell(workingBoard, row, col)));
      setGameStatus("lost");
      return;
    }

    const nextBoard = revealCell(workingBoard, row, col);
    setBoard(nextBoard);
    if (shieldState === "active") {
      setShieldState("used");
    }
  }

  function flagCellAt(row, col) {
    if (gameStatus === "lost") return;
    setBoard((prevBoard) => toggleFlag(prevBoard, row, col, config.mines));
  }

  function chordCellAt(row, col) {
    if (gameStatus !== "playing") return;
    clearHintHighlight();

    const nextBoard = chordCell(board, row, col);
    if (nextBoard === board) return;

    const hitMine = nextBoard.flat().some((cell) => cell.isMine && cell.isRevealed);

    if (hitMine) {
      setBoard(revealAllMines(nextBoard));
      setGameStatus("lost");
    } else {
      setBoard(nextBoard);
    }
  }

  function useHint() {
    if (gameStatus !== "playing") return;
    if (hintsUsed >= MAX_HINTS) return;

    const cell = findHintCell(board);
    if (!cell) return;

    clearTimeout(hintTimeoutRef.current);
    setHintCell({ row: cell.row, col: cell.col });
    setHintsUsed((count) => count + 1);

    hintTimeoutRef.current = setTimeout(() => {
      setHintCell(null);
    }, HINT_HIGHLIGHT_MS);
  }

  const flagCount = countFlags(board);
  const minesRemaining = config.mines - flagCount;
  const cellsRevealed = countRevealedSafeCells(board);
  const score = calculateScore(cellsRevealed, TIME_LIMIT_SECONDS - timeElapsed, hintsUsed);
  const hintsRemaining = MAX_HINTS - hintsUsed;

  function activateShield() {
    if (shieldState === "available") {
      setShieldState("active");
    }
  }

  return {
    difficulty,
    config,
    board,
    gameStatus,
    timeElapsed,
    hintsUsed,
    hintsRemaining,
    hintCell,
    minesRemaining,
    cellsRevealed,
    score,
    saveStatus,
    shieldState,
    activateShield,
    changeDifficulty: resetGame,
    restart: () => resetGame(),
    revealCellAt,
    flagCellAt,
    chordCellAt,
    useHint,
  };
}
```

---

## 🖼️ Primary Page Controllers

Below are key JSX layouts showcasing user flows.

### 🎮 The Game Board Page (`frontend/src/pages/Game.jsx`)
Exposes full user control: difficulty selection, countdown display, the minefield matrix, the shield panel trigger, and a restart mechanism.
```jsx
import { useState, useEffect } from "react";
import { useMinesweeper } from "../hooks/useMinesweeper";
import { DIFFICULTIES, TIME_LIMIT_SECONDS } from "../utils/minesweeper";
import { fetchStats } from "../services/gameService";
import DifficultySelector from "../components/DifficultySelector";
import MinesweeperBoard from "../components/MinesweeperBoard";
import ResultModal from "../components/ResultModal";
import "./Game.css";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function Game() {
  const {
    difficulty,
    board,
    gameStatus,
    timeElapsed,
    hintsUsed,
    hintsRemaining,
    hintCell,
    minesRemaining,
    cellsRevealed,
    score,
    saveStatus,
    shieldState,
    activateShield,
    changeDifficulty,
    restart,
    revealCellAt,
    flagCellAt,
    chordCellAt,
    useHint,
  } = useMinesweeper();

  const hintDisabled = gameStatus !== "playing" || hintsRemaining <= 0;
  const [previousBest, setPreviousBest] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStats(difficulty)
      .then((data) => {
        if (!cancelled) setPreviousBest(data.stats.highestScore);
      })
      .catch(() => {
        if (!cancelled) setPreviousBest(null);
      });
    return () => { cancelled = true; };
  }, [difficulty]);

  useEffect(() => {
    if (gameStatus === "lost") {
      setIsNewBest(previousBest === null || score > previousBest);
    } else if (gameStatus === "ready") {
      setIsNewBest(false);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === "lost" && saveStatus === "saved") {
      setPreviousBest((prev) => (prev === null || score > prev ? score : prev));
    }
  }, [saveStatus]);

  return (
    <div className="page">
      <div className="header-flex">
        <div>
          <h2>OPERATOR CONSOLE</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
            SYSTEM STATUS: ACTIVE
          </p>
        </div>
        <div className="game-actions">
          <button
            type="button"
            className="btn"
            onClick={useHint}
            disabled={hintDisabled}
            style={{ marginRight: "0.5rem" }}
          >
            💡 HINT ({hintsRemaining})
          </button>
          <button type="button" className="btn btn-primary" onClick={restart}>
            🔄 RESTART
          </button>
        </div>
      </div>

      <DifficultySelector difficulty={difficulty} onChange={changeDifficulty} />

      <div className="game-area">
        <div className="status-bar">
          <div>DIFFICULTY: <span>{DIFFICULTIES[difficulty].label.toUpperCase()}</span></div>
          <div>MINES: <span>{minesRemaining}</span></div>
          <div>🚩 FLAGS: <span>{DIFFICULTIES[difficulty].mines - minesRemaining}</span></div>
          <div>SCORE: <span>{score}</span></div>
        </div>

        <div className={`countdown-display ${timeElapsed <= 30 ? "countdown-display--low" : ""}`}>
          <span className="countdown-icon">⏱</span>
          <span className="countdown-time">{formatTime(timeElapsed)}</span>
        </div>

        <MinesweeperBoard
          board={board}
          gameStatus={gameStatus}
          hintCell={hintCell}
          onReveal={revealCellAt}
          onFlag={flagCellAt}
          onChord={chordCellAt}
        />

        <div className={`shield-panel shield-panel--${shieldState}`}>
          <span className="shield-label">
            🛡 SHIELD:{" "}
            <strong>
              {shieldState === "available" && "READY"}
              {shieldState === "active"    && "ACTIVE"}
              {shieldState === "used"      && "USED"}
            </strong>
          </span>
          <button
            type="button"
            className="btn shield-btn"
            onClick={activateShield}
            disabled={shieldState !== "available" || gameStatus === "lost"}
          >
            {shieldState === "available" && "Activate Shield"}
            {shieldState === "active"    && "Shield Active"}
            {shieldState === "used"      && "Shield Used"}
          </button>
        </div>
      </div>

      <ResultModal
        gameStatus={gameStatus}
        score={score}
        timeElapsed={TIME_LIMIT_SECONDS - timeElapsed}
        cellsRevealed={cellsRevealed}
        hintsUsed={hintsUsed}
        saveStatus={saveStatus}
        isNewBest={isNewBest}
        onRestart={restart}
      />
    </div>
  );
}

export default Game;
```

---

## 🔑 Crucial Routing & Authentication Guard

Uses a client-side route guard checking if a local identity representation exists in `AuthContext` to secure pages (Dashboard, Leaderboard, History, Game, Profile).

#### 📄 Protected Route Wrapper (`frontend/src/components/ProtectedRoute.jsx`)
```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
```
