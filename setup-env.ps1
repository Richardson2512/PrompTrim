# PowerShell script to set up environment variables for PromptTrim
# Run this script: .\setup-env.ps1

Write-Host "🚀 Setting up PromptTrim Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "❌ Setup cancelled." -ForegroundColor Red
        exit
    }
}

# Get Supabase credentials
Write-Host "📝 Please enter your Supabase credentials:" -ForegroundColor Green
Write-Host "(You can find these in Supabase Dashboard → Settings → API)" -ForegroundColor Gray
Write-Host ""

$supabaseUrl = Read-Host "Supabase URL"
$supabaseKey = Read-Host "Supabase Anon Key"

# Create .env file
$envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseKey

# Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyBn7zHmeXe54sTv9UKV-4vDBt446yXJ5a0
"@

# Write to .env file
Set-Content -Path ".env" -Value $envContent

Write-Host ""
Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your configuration:" -ForegroundColor Cyan
Write-Host "  - Supabase URL: $supabaseUrl" -ForegroundColor White
Write-Host "  - Gemini API Key: Configured ✓" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm install" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Open your browser and start optimizing prompts!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: The AI-powered optimization will work automatically!" -ForegroundColor Magenta

