$ErrorActionPreference = 'Stop'
$experiment = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'setup.json') -Raw | ConvertFrom-Json
Push-Location -LiteralPath $experiment.app
try {
    # Loopback only. Existing guard blocks all upstream requests from this server.
    & node --import ./offline-guard.mjs server.js --port $experiment.port
} finally {
    Pop-Location
}
