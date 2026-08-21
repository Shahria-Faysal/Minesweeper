# Minesweeper Web Application

React (Vite) frontend + Plain PHP backend + MySQL. All 8 phases complete.

## Structure
```
minesweeper-web-app/
├── frontend/
│   ├── .env.example                configure API_BASE_URL here (Phase 8)
│   └── src/
│       ├── utils/minesweeper.js
│       ├── hooks/ (useAuth, useMinesweeper, useTheme)
│       ├── context/ (AuthContext, ThemeContext — dark mode, Phase 8)
│       ├── styles/tables.css       filter bar / table / stat-card / dashboard-header styles
│       ├── components/
│       │   ├── Navbar.jsx           NavLink-based, brand, theme toggle (Phase 8)
│       │   ├── ThemeToggle.jsx      ☀ Light / 🌙 Dark switch (Phase 8)
│       │   ├── FilterBar.jsx        shared filter buttons (Phase 8 dedup)
│       │   ├── ProtectedRoute.jsx
│       │   ├── Cell.jsx / MinesweeperBoard.jsx   responsive board sizing (Phase 8)
│       │   ├── GameHeader.jsx       shows Hints Remaining (Phase 8)
│       │   └── ResultModal.jsx      final win/lose copy + nav buttons (Phase 8)
│       ├── pages/
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Game.jsx + Game.css
│       │   ├── Leaderboard.jsx / History.jsx
│       │   ├── Dashboard.jsx        Play Minesweeper CTA (Phase 8)
│       │   └── Profile.jsx          real content, no longer a placeholder (Phase 8)
│       └── services/ (api.js, authService.js, gameService.js)
├── backend/            PHP API (goes inside XAMPP htdocs)
│   ├── config/ (db.php, cors.php, auth.php)
│   ├── register.php / login.php / logout.php
│   ├── save-score.php
│   └── leaderboard.php / history.php / stats.php
├── database/
│   └── schema.sql
└── README.md
```

## Progress
- **Phase 1–7** — full stack: PHP-session auth, complete Minesweeper
  game (mine placement, flood fill, hints, timer, scoring), saving
  results to MySQL, leaderboard, personal history, and statistics.
  All done.
- **Phase 8 (final polish)** — done:
  - **Dark mode**: `ThemeContext` toggles a `data-theme` attribute on
    `<html>`; every color in the app is a CSS variable in `index.css`
    keyed off that attribute. Persisted via `localStorage` and
    defaults to the OS preference on first visit.
  - **Responsive design**: the board's cell size is a CSS variable
    (`--cell-size`) overridden at two breakpoints, so the grid shrinks
    on phones without any JS; long tables scroll horizontally instead
    of breaking layout; the navbar wraps; stat cards reflow.
  - **Consistent design**: every page renders inside the same
    `.page` card, and every button in the app uses one shared
    `.btn` / `.btn-primary` / `.btn-active` system instead of each
    page defining its own button CSS.
  - **Dashboard**: now has a "Play Minesweeper" call-to-action button
    alongside the existing stats.
  - **Game UI / result screens**: header now shows Hints *Remaining*;
    the win/lose modal matches the requested copy exactly and adds
    "View Statistics" / "Leaderboard" navigation buttons.
  - **Cleanup**: extracted a shared `FilterBar` component (was
    duplicated in Leaderboard and Dashboard); `API_BASE_URL` is now
    configurable via `.env` (see `.env.example`) instead of hardcoded;
    removed an unused import; confirmed no console errors, no
    unused imports, and no lint errors project-wide.

**Before running:** copy `frontend/.env.example` to `frontend/.env`
and adjust `VITE_API_BASE_URL` if your `backend/` folder lives
somewhere other than `http://localhost/backend` in htdocs. If you skip
this, the app still works — it falls back to that same default.

See the setup instructions provided by Claude in chat for full
step-by-step installation and testing instructions.
