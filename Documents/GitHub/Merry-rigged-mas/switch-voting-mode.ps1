# PowerShell script to switch voting modes for the Christmas Lights app

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("normal_mode", "joke_mode")]
    [string]$Mode
)

Write-Host "🎄 Christmas Lights Voting Mode Switcher 🎄" -ForegroundColor Yellow
Write-Host ""

# Update wrangler.toml
$wranglerPath = ".\wrangler.toml"
if (-not (Test-Path $wranglerPath)) {
    Write-Host "❌ Error: wrangler.toml not found in current directory" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Updating wrangler.toml..." -ForegroundColor Blue

# Read the file
$content = Get-Content $wranglerPath -Raw

# Update the VOTING_MODE in both global vars and production vars
$content = $content -replace 'VOTING_MODE = "[^"]*"', "VOTING_MODE = `"$Mode`""

# Write back to file
Set-Content $wranglerPath $content

Write-Host "✅ Updated wrangler.toml with voting mode: $Mode" -ForegroundColor Green

# Build and deploy
Write-Host ""
Write-Host "🔨 Building project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🚀 Deploying to production..." -ForegroundColor Blue
    wrangler pages deploy dist --project-name=merry-rigged-mas --branch=production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        
        if ($Mode -eq "normal_mode") {
            Write-Host "🗳️  Voting is now FAIR - votes go to the house users actually select" -ForegroundColor Cyan
        } else {
            Write-Host "🎭 Voting is now RIGGED - all votes redirect to House #7 with jokes!" -ForegroundColor Magenta
        }
        
        Write-Host "🌐 Live at: https://looplights.oozle.app" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎄 Done! 🎄" -ForegroundColor Yellow