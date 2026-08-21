# Minesweeper Web Application

Project skeleton: React (Vite) frontend + Plain PHP backend + MySQL.

## Structure
```
minesweeper-web-app/
├── frontend/
│   └── src/
│       ├── utils/minesweeper.js
│       ├── hooks/ (useAuth, useMinesweeper)
│       ├── context/AuthContext.jsx
│       ├── styles/tables.css           filter bar / table / stat-card styles (Phase 7)
│       ├── components/ (Navbar, ProtectedRoute, Cell, MinesweeperBoard,
│       │                GameHeader, DifficultySelector, ResultModal)
│       ├── pages/
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Game.jsx + Game.css       now shows 🎉 NEW PERSONAL BEST! (Phase 7)
│       │   ├── Leaderboard.jsx           top 10 wins, All/Beginner/Advanced filter (Phase 7)
│       │   ├── History.jsx               logged-in user's own games, newest first (Phase 7)
│       │   ├── Dashboard.jsx             personal stats + streaks (Phase 7)
│       │   └── Profile.jsx               still a placeholder
│       └── services/
│           ├── api.js                    apiPost + apiGet
│           ├── authService.js
│           └── gameService.js            saveGameResult / fetchLeaderboard / fetchHistory / fetchStats
├── backend/            PHP API (goes inside XAMPP htdocs)
│   ├── config/ (db.php, cors.php, auth.php)
│   ├── register.php / login.php / logout.php
│   ├── save-score.php
│   ├── leaderboard.php    implemented — JOIN users+game_results, top 10 wins (Phase 7)
│   ├── history.php        implemented — session-scoped, newest first (Phase 7)
│   └── stats.php          implemented — COUNT/SUM/AVG/MAX/MIN + PHP-computed streaks (Phase 7)
├── database/
│   └── schema.sql
└── README.md
```

## Progress
- **Phase 1–6** — project setup, auth (backend + UI), full Minesweeper
  game (mine placement, flood fill, hints, timer, scoring), and
  saving finished games to MySQL. All done.
- **Phase 7** — Leaderboard (top 10 wins, filterable by difficulty),
  personal History (session-scoped, never trusts a client-supplied
  user id), and a Dashboard of personal statistics (games played/won/
  lost, win rate, highest score, best time, average score, current +
  best win streak, all filterable by difficulty). The Game page now
  fetches the player's current best for the selected difficulty
  before the game starts, so a win can show "🎉 NEW PERSONAL BEST!"
  the moment it happens. Done.

**Before running:** open `frontend/src/services/api.js` and set
`API_BASE_URL` to wherever you put the `backend/` folder in htdocs.

See the setup instructions provided by Claude in chat for full
step-by-step installation and testing instructions.
