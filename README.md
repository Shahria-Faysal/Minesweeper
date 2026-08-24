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
│   └── schema.sql                          database and table definitions
└── README.md
```

## Current Behavior
The game uses survival mode. A game ends when the player reveals a mine
or when the two-minute countdown reaches zero. There is no separate win
state or clear-the-board objective.

The score rewards revealed safe cells and applies a penalty for hints:

```
score = (cells_revealed × 10) − (hints_used × 50)
```

Each game starts with a **2-minute countdown timer** at `02:00`. If the
timer reaches `00:00`, all mines are revealed and the result is saved.
The `time_taken` value records how many seconds the player survived.

The leaderboard ranks the ten highest scores across all games. Personal
history and statistics are limited to the logged-in user.

**Before running:** copy `frontend/.env.example` to `frontend/.env`
and adjust `VITE_API_BASE_URL` if needed (falls back to
`http://localhost/backend` otherwise).
