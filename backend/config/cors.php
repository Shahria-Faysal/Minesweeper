<?php
// ---- 1 & 2: CORS headers -------------------------------------------------

// Vite's dev server defaults to port 5173 but falls back to 5174 (or
// higher) if that port is already taken. We allow both so that a stale
// process on 5173 doesn't break a second dev tab running on 5174.
// A wildcard ("*") is NOT allowed by browsers when credentials are
// involved, so we must echo back the exact requesting origin.
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

// Browsers send an OPTIONS "preflight" request before the real POST/GET
// whenever the request has a JSON body or credentials. There is nothing
// to process here — just confirm the CORS headers above and stop.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---- Session cookie config -----------------------------------------------

// Must be set BEFORE session_start(). "Lax" + explicit origin above is
// enough for same-site-but-different-port local development. In
// production (real domain, HTTPS) 'secure' should be set to true.
session_set_cookie_params([
    'lifetime' => 0,          // expires when the browser closes
    'path'     => '/',
    'domain'   => 'localhost',
    'secure'   => false,      // true once served over HTTPS
    'httponly' => true,       // JS on the page can't read the cookie
    'samesite' => 'Lax',
]);

session_start();

header('Content-Type: application/json');
