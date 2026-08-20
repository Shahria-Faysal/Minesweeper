# Minesweeper Web Application

Project skeleton: React (Vite) frontend + Plain PHP backend + MySQL.

## Structure
```
minesweeper-web-app/
├── frontend/
│   └── src/
│       ├── utils/minesweeper.js       pure game logic — no React (Phase 4)
│       ├── hooks/
│       │   ├── useAuth.js
│       │   └── useMinesweeper.js       game state + actions (Phase 4)
│       ├── context/AuthContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── Cell.jsx                one board square (Phase 4)
│       │   ├── MinesweeperBoard.jsx     grid of Cells (Phase 4)
│       │   ├── GameHeader.jsx           mines/timer/score + buttons (Phase 4)
│       │   ├── DifficultySelector.jsx   Beginner/Advanced picker (Phase 4)
│       │   └── ResultModal.jsx          win/lose popup (Phase 4)
│       ├── pages/
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Game.jsx + Game.css      full Minesweeper page (Phase 4)
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
  flood-fill reveal, flagging, win/lose detection, timer, live score,
  hint system, restart, difficulty switch. Done. Score is frontend-only
  for now — nothing is saved to MySQL yet.

**Before running:** open `frontend/src/services/api.js` and set
`API_BASE_URL` to wherever you put the `backend/` folder in htdocs.

See the setup instructions provided by Claude in chat for full
step-by-step installation and testing instructions.
