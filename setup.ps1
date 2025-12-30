# AI Resume Creator Setup Script
# Run this script to help set up your environment

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== AI Resume Creator Setup ===" -ForegroundColor Cyan
Write-Host ""

function Get-VersionSafe($cmd) {
    try {
        return (& $cmd 2>&1 | Select-Object -First 1)
    }
    catch {
        return "NOT FOUND"
    }
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$pythonVersion = Get-VersionSafe "python"
Write-Host "Python: $pythonVersion" -ForegroundColor Green

$nodeVersion = Get-VersionSafe "node"
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green

$pnpmVersion = Get-VersionSafe "pnpm"
Write-Host "pnpm: $pnpmVersion" -ForegroundColor Green

$dockerVersion = Get-VersionSafe "docker"
Write-Host "Docker: $dockerVersion" -ForegroundColor Green

Write-Host ""
Write-Host "Prerequisite check complete." -ForegroundColor Green
Write-Host ""

# Generate encryption key
Write-Host "Generating encryption key..." -ForegroundColor Yellow
try {
    $encryptionKey = python -c "import secrets; print(secrets.token_hex(32))"
}
catch {
    Write-Host "Python not available. Cannot generate ENCRYPTION_KEY." -ForegroundColor Red
    Write-Host "Install Python or set ENCRYPTION_KEY manually." -ForegroundColor Red
    exit 1
}
Write-Host "Encryption key generated." -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host ".env file already exists." -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y") {
        Write-Host "Keeping existing .env file." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Creating .env file..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please provide the following information:" -ForegroundColor Cyan
Write-Host ""

# Get Supabase details (ASCII prompts only)
$supabaseUrl = Read-Host "Supabase URL (Project Settings -> API)"
$supabaseAnonKey = Read-Host "Supabase Anon Key (Project Settings -> API)"
$supabaseServiceKey = Read-Host "Supabase Service Key (Project Settings -> API)"
$databaseUrl = Read-Host "Database URL (Project Settings -> Database -> Connection string)"

Write-Host ""
Write-Host "Auth Configuration:" -ForegroundColor Cyan
Write-Host "1. Use Dev Auth Bypass (easier for local dev)"
Write-Host "2. Use AWS Cognito (production-like setup)"
$authChoice = Read-Host "Choose option (1 or 2)"

# Initialize variables used later
$devAuthBypass = "false"
$cognitoConfig = ""
$ollamaUrl = ""
$cognitoUserPoolId = ""
$cognitoClientId = ""
$cognitoRegion = ""

if ($authChoice -eq "1") {
    $devAuthBypass = "true"
}
elseif ($authChoice -eq "2") {
    $devAuthBypass = "false"
    $cognitoUserPoolId = Read-Host "Cognito User Pool ID"
    $cognitoClientId = Read-Host "Cognito Client ID"
    $cognitoRegion = Read-Host "Cognito Region (e.g., us-east-1)"

    $cognitoConfig = @"
COGNITO_USER_POOL_ID=$cognitoUserPoolId
COGNITO_CLIENT_ID=$cognitoClientId
COGNITO_REGION=$cognitoRegion
COGNITO_JWKS_URL=https://cognito-idp.$cognitoRegion.amazonaws.com/$cognitoUserPoolId/.well-known/jwks.json
"@
}
else {
    Write-Host "Invalid auth choice. Defaulting to Dev Auth Bypass." -ForegroundColor Yellow
    $devAuthBypass = "true"
}

Write-Host ""
Write-Host "AI Provider Configuration:" -ForegroundColor Cyan
Write-Host "1. Mock (testing, no API key needed)"
Write-Host "2. OpenAI (requires API key)"
Write-Host "3. Ollama (local, requires Ollama running)"
$aiChoice = Read-Host "Choose option (1, 2, or 3)"

$aiProvider = "mock"
$openaiKey = ""

switch ($aiChoice) {
    "1" {
        $aiProvider = "mock"
        $openaiKey = ""
    }
    "2" {
        $aiProvider = "openai"
        $openaiKey = Read-Host "OpenAI API Key"
    }
    "3" {
        $aiProvider = "ollama"
        $ollamaUrl = Read-Host "Ollama URL (default: http://localhost:11434)"
        if ([string]::IsNullOrWhiteSpace($ollamaUrl)) {
            $ollamaUrl = "http://localhost:11434"
        }
        $openaiKey = ""
    }
    default {
        Write-Host "Invalid AI choice. Defaulting to mock." -ForegroundColor Yellow
        $aiProvider = "mock"
        $openaiKey = ""
    }
}

# Quote values that often contain special characters
# Basic escaping for embedded quotes (rare but safe)
function ConvertTo-EnvValue([string]$v) {
    if ($null -eq $v) { return '""' }
    $escaped = $v -replace '"', '\"'
    return '"' + $escaped + '"'
}


# Create .env content
$envContent = @"
# Supabase Configuration
SUPABASE_URL=$(ConvertTo-EnvValue $supabaseUrl)
SUPABASE_ANON_KEY=$(ConvertTo-EnvValue $supabaseAnonKey)
SUPABASE_SERVICE_KEY=$(ConvertTo-EnvValue $supabaseServiceKey)
DATABASE_URL=$(ConvertTo-EnvValue $databaseUrl)

# Auth Configuration
$($cognitoConfig.TrimEnd())
DEV_AUTH_BYPASS=$(ConvertTo-EnvValue $devAuthBypass)

# AI Provider Configuration
AI_PROVIDER=$(ConvertTo-EnvValue $aiProvider)
OPENAI_API_KEY=$(ConvertTo-EnvValue $openaiKey)
OLLAMA_URL=$(ConvertTo-EnvValue $ollamaUrl)

# Embedding Model Configuration
EMBEDDING_PROVIDER="openai"
EMBEDDING_MODEL="text-embedding-3-small"
EMBEDDING_DIMENSION="1536"

# Redis Configuration
REDIS_URL="redis://localhost:6379/0"

# Encryption Key
ENCRYPTION_KEY=$(ConvertTo-EnvValue $encryptionKey)

# Backend Configuration
API_HOST="0.0.0.0"
API_PORT="8000"
ENVIRONMENT="development"

# Worker Configuration
CELERY_CONCURRENCY="2"

# Frontend Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_COGNITO_DOMAIN="xxxxx.auth.us-east-1.amazoncognito.com"
NEXT_PUBLIC_COGNITO_CLIENT_ID="xxxxx"
NEXT_PUBLIC_REDIRECT_URI="http://localhost:3000/callback"
"@

# Write .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8

Write-Host ""
Write-Host ".env file created successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Activate virtual environment: .\venv\Scripts\Activate.ps1"
Write-Host "2. Install dependencies: pip install -r requirements.txt"
Write-Host "3. Install shared package: pip install -e ./shared"
Write-Host "4. Install dev dependencies: pip install -r requirements-dev.txt"
Write-Host "5. Run migrations: cd migrations; alembic upgrade head"
Write-Host "6. Start services (see QUICK_START.md)"
Write-Host ""
