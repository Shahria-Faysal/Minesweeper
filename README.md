# Minesweeper Web Application

React (Vite) frontend + Plain PHP backend + MySQL.

## Structure
```
minesweeper-web-app/
├── frontend/
│   ├── .env.example
│   └── src/
│       ├── utils/minesweeper.js    game logic — no win condition; score
│       │                            rewards cells revealed + time survived
│       ├── hooks/ (useAuth, useMinesweeper, useTheme)
│       ├── context/ (AuthContext, ThemeContext)
│       ├── styles/tables.css
│       ├── components/ (Navbar, ThemeToggle, FilterBar, ProtectedRoute,
│       │                Cell, MinesweeperBoard, GameHeader, DifficultySelector,
│       │                ResultModal — single "GAME OVER" screen, no win branch)
│       ├── pages/ (Login, Register, Game, Leaderboard, History, Dashboard, Profile)
│       └── services/ (api.js, authService.js, gameService.js)
├── backend/
│   ├── config/ (db.php, cors.php, auth.php)
│   ├── register.php / login.php / logout.php
│   ├── save-score.php   no "result" field — validates cells_revealed instead
│   ├── leaderboard.php  ranks ALL games by score (no win filter)
│   ├── history.php
│   └── stats.php        no win rate / streaks — highest score, longest
│                          survival, most cells revealed, average score
├── database/
│   ├── schema.sql                          fresh installs — no `result` column
│   └── migration-remove-win-condition.sql  run this if you already have data
└── README.md
```

## Progress
All original 8 phases are done, plus one design change: **the win
condition was removed.** The game now only ends by hitting a mine —
there's no "clear the board" win state. Score rewards progress and
survival instead of speed-to-completion:

```
score = (cells_revealed × 10) + (time_survived × 2) − (hints_used × 50)
```

Each game has a **2-minute countdown timer**, starting at `02:00` and
running down to `00:00`. If the timer reaches zero, the game ends and
all mines are revealed. The saved `time_taken` value records how many
seconds the player survived.

Everywhere this touched:
- **Game logic** — `checkWin()` removed; `gameStatus` only has
  `"ready" | "playing" | "lost"`; the timer counts down from 120 seconds
  and timeout ends the game.
- **Result screen** — one unified "💣 GAME OVER" screen (was two).
- **Dashboard** — Games Won/Lost, Win Rate, and win streaks removed
  (they don't mean anything without a win); replaced with Highest
  Score, Average Score, Longest Survival, Most Cells Revealed.
- **Leaderboard** — ranks the top 10 scores across ALL games, not
  just wins.
- **Database** — `game_results.result` column dropped; `cells_revealed`
  column added. **If you already have data**, run
  `database/migration-remove-win-condition.sql` in phpMyAdmin instead
  of re-importing `schema.sql` (existing rows keep their score/time
  but get `cells_revealed = 0`, since that wasn't tracked before).

**Before running:** copy `frontend/.env.example` to `frontend/.env`
and adjust `VITE_API_BASE_URL` if needed (falls back to
`http://localhost/backend` otherwise).

See the setup instructions provided by Claude in chat for full
step-by-step installation and testing instructions.
