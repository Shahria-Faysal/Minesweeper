# Minesweeper Web Application

Project skeleton: React (Vite) frontend + Plain PHP backend + MySQL.

## Structure
```
minesweeper-web-app/
├── frontend/
│   └── src/
│       ├── utils/minesweeper.js       pure game logic — no React
│       ├── hooks/
│       │   ├── useAuth.js
│       │   └── useMinesweeper.js       game state, timer, hints, AUTO-SAVES result once (Phase 6)
│       ├── context/AuthContext.jsx
│       ├── components/  (Navbar, ProtectedRoute, Cell, MinesweeperBoard,
│       │                 GameHeader, DifficultySelector, ResultModal)
│       ├── pages/
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Game.jsx + Game.css
│       │   └── Dashboard/Leaderboard/History/Profile  still placeholders
│       └── services/
│           ├── api.js
│           ├── authService.js
│           └── gameService.js          saveGameResult() → save-score.php (Phase 6)
├── backend/            PHP API (goes inside XAMPP htdocs)
│   ├── config/ (db.php, cors.php, auth.php)
│   ├── register.php / login.php / logout.php
│   ├── save-score.php   implemented — session-based, validated, dedup'd (Phase 6)
│   └── leaderboard.php / history.php / stats.php   still Phase-1 stubs
├── database/
│   └── schema.sql
└── README.md
```

## Progress
- **Phase 1** — project structure, routing, database schema. Done.
- **Phase 2** — authentication backend (register / login / logout,
  sessions, CORS). Done.
- **Phase 3** — React authentication UI. Done.
- **Phase 4** — full Minesweeper game in React. Done.
- **Phase 5** — hints capped at 3/game with temporary highlight
  (no auto-reveal); result screen polish. Done.
- **Phase 6** — finished games are now saved to MySQL: React sends
  `difficulty/score/time_taken/result/hints_used` to `save-score.php`,
  which identifies the player from the session (never from the
  request), re-validates and recomputes the score server-side, and
  guards against duplicate submissions. Leaderboard/history/stats
  views still don't exist yet — the data is just being collected now.

**Before running:** open `frontend/src/services/api.js` and set
`API_BASE_URL` to wherever you put the `backend/` folder in htdocs.

See the setup instructions provided by Claude in chat for full
step-by-step installation and testing instructions.
