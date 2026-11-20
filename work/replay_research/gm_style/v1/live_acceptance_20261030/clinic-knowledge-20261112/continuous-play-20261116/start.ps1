$ErrorActionPreference = 'Stop'
$continuationSetup = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'setup.json') -Raw | ConvertFrom-Json
Push-Location -LiteralPath $continuationSetup.app
try {
    & node --import ./offline-guard.mjs server.js --port $continuationSetup.port
} finally {
    Pop-Location
}
