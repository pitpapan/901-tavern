$ErrorActionPreference = 'Stop'
$setup = Get-Content -Encoding UTF8 -Raw -LiteralPath (Join-Path $PSScriptRoot 'setup.json') | ConvertFrom-Json
Push-Location -LiteralPath $setup.app
try {
    & node --import ./offline-guard.mjs server.js --port $setup.port
} finally {
    Pop-Location
}
