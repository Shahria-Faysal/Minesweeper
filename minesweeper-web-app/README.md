# Minesweeper Web Application

Project skeleton: React (Vite) frontend + Plain PHP backend + MySQL.

## Structure
```
minesweeper-web-app/
├── frontend/
│   └── src/
│       ├── context/AuthContext.jsx   frontend "who's logged in" state (Phase 3)
│       ├── hooks/useAuth.js           hook to read/update auth state (Phase 3)
│       ├── components/
│       │   ├── Navbar.jsx             auth-aware nav + logout (Phase 3)
│       │   └── ProtectedRoute.jsx     redirects guests to Login (Phase 3)
│       ├── pages/
│       │   ├── Login.jsx              real form, wired to backend (Phase 3)
│       │   ├── Register.jsx           real form, wired to backend (Phase 3)
│       │   └── Dashboard/Game/Leaderboard/History/Profile  placeholders, now protected
│       └── services/
│           ├── api.js                 API_BASE_URL + shared fetch helper
│           └── authService.js         registerUser / loginUser / logoutUser
├── backend/            PHP API (goes inside XAMPP htdocs)
│   └── config/
│       ├── db.php       PDO connection
│       ├── cors.php      CORS headers + session bootstrap (Phase 2)
│       └── auth.php      require_login() / current_user_id() (Phase 2)
├── database/
│   └── schema.sql       Run this in phpMyAdmin to create the DB
└── README.md
```

## Progress
- **Phase 1** — project structure, routing, database schema. Done.
- **Phase 2** — authentication backend (register / login / logout,
  sessions, CORS). Done.
- **Phase 3** — React authentication UI: Login/Register forms,
  logout, protected routes, auth-aware navbar. Done. Minesweeper
  gameplay itself is still a placeholder page.

**Before running:** open `frontend/src/services/api.js` and set
`API_BASE_URL` to wherever you put the `backend/` folder in htdocs.

See the setup instructions provided by Claude in chat for full
step-by-step installation and testing instructions.
