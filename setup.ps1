# Quick setup script for QuickGPT Server
# Run this in PowerShell: .\setup.ps1

Write-Host ""
Write-Host "========================================"
Write-Host "   QuickGPT Server Setup Script"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $null = node --version
    Write-Host "[✓] Node.js found" -ForegroundColor Green
}
catch {
    Write-Host "[✗] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/"
    exit 1
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path "server\.env")) {
    Write-Host "[!] .env file not found in server/" -ForegroundColor Yellow
    
    if (Test-Path "server\.env.example") {
        Write-Host "[i] Creating .env from .env.example..."
        Copy-Item "server\.env.example" "server\.env"
        Write-Host "[✓] Created server/.env" -ForegroundColor Green
        Write-Host ""
        Write-Host "[!] IMPORTANT: Edit server/.env with your MongoDB URI and other credentials!" -ForegroundColor Yellow
        Write-Host ""
    }
    else {
        Write-Host "[✗] .env.example not found" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "[✓] .env file found" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "[i] Installing server dependencies..."
Push-Location server
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Failed to install dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location
Write-Host "[✓] Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "========================================"
Write-Host "   Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit server/.env with your MongoDB URI"
Write-Host "2. Run: npm run server (from server directory)"
Write-Host "3. Frontend: npm run dev (from client directory)"
Write-Host ""
Write-Host "For help, see: TROUBLESHOOTING.md" -ForegroundColor Cyan
Write-Host ""
