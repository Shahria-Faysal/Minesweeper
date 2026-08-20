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
│       │   └── useMinesweeper.js       game state, timer, capped hints (Phase 5)
│       ├── context/AuthContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── Cell.jsx                supports temporary hint highlight (Phase 5)
│       │   ├── MinesweeperBoard.jsx
│       │   ├── GameHeader.jsx           shows Hints: X/3 (Phase 5)
│       │   ├── DifficultySelector.jsx
│       │   └── ResultModal.jsx          matches win/lose result format (Phase 5)
│       ├── pages/
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Game.jsx + Game.css
│       │   └── Dashboard/Leaderboard/History/Profile  still placeholders
│       └── services/
│           ├── api.js
│           └── authService.js
├── backend/            PHP API (goes inside XAMPP htdocs)
├── database/
│   └── schema.sql
└── README.md
```

## Progress
- **Phase 1** — project structure, routing, database schema. Done.
- **Phase 2** — authentication backend (register / login / logout,
  sessions, CORS). Done.
- **Phase 3** — React authentication UI: forms, logout, protected
  routes, auth-aware navbar. Done.
- **Phase 4** — full Minesweeper game in React (Beginner 9×9/10 mines,
  Advanced 16×16/40 mines): mine placement with first-click safety,
  flood-fill reveal, flagging, win/lose detection, timer, restart,
  difficulty switch. Done.
- **Phase 5** — polish pass: hints are now capped at 3 per game, cost
  50 points each, and only *highlight* a safe cell temporarily
  (never auto-reveal it); result screen matches the exact win/lose
  copy requested. Done. Score is still frontend-only — nothing is
  saved to MySQL yet.

**Before running:** open `frontend/src/services/api.js` and set
`API_BASE_URL` to wherever you put the `backend/` folder in htdocs.

See the setup instructions provided by Claude in chat for full
step-by-step installation and testing instructions.
