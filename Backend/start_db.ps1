$mongoPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$dbPath = ".\data\db"

if (-not (Test-Path $dbPath)) {
    New-Item -ItemType Directory -Force -Path $dbPath
}

Write-Host "Starting MongoDB..."
& $mongoPath --dbpath $dbPath
