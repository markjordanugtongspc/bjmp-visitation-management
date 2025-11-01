# PowerShell Script to Create Assistant Warden Views
# This script copies warden views and updates route references

Write-Host "Creating Assistant Warden Views..." -ForegroundColor Cyan

# Define source and destination paths
$sourceDir = "resources\views\warden"
$destDir = "resources\views\assistant_warden"

# Create destination directory if it doesn't exist
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    Write-Host "Created directory: $destDir" -ForegroundColor Green
}

# Function to copy and update file content
function Copy-AndUpdateFile {
    param (
        [string]$SourceFile,
        [string]$DestFile
    )
    
    # Read content
    $content = Get-Content $SourceFile -Raw
    
    # Replace route references
    $content = $content -replace "route\('warden\.", "route('assistant-warden."
    $content = $content -replace "route\(`"warden\.", "route(`"assistant-warden."
    $content = $content -replace "/warden/", "/assistant-warden/"
    $content = $content -replace "Warden Dashboard", "Assistant Warden Dashboard"
    $content = $content -replace "warden\.inmates", "assistant-warden.inmates"
    $content = $content -replace "warden\.officers", "assistant-warden.officers"
    $content = $content -replace "warden\.visitors", "assistant-warden.visitors"
    $content = $content -replace "warden\.supervision", "assistant-warden.supervision"
    
    # Write to destination
    Set-Content -Path $DestFile -Value $content
    Write-Host "  Created: $DestFile" -ForegroundColor Green
}

# Copy dashboard.blade.php
$sourceDashboard = Join-Path $sourceDir "dashboard.blade.php"
$destDashboard = Join-Path $destDir "dashboard.blade.php"
if (Test-Path $sourceDashboard) {
    Copy-AndUpdateFile -SourceFile $sourceDashboard -DestFile $destDashboard
}

# Copy subdirectories and files
$subdirs = @("inmates", "officers", "visitors", "supervision")

foreach ($subdir in $subdirs) {
    $sourceSubdir = Join-Path $sourceDir $subdir
    $destSubdir = Join-Path $destDir $subdir
    
    if (Test-Path $sourceSubdir) {
        # Create subdirectory
        if (-not (Test-Path $destSubdir)) {
            New-Item -ItemType Directory -Path $destSubdir -Force | Out-Null
            Write-Host "Created directory: $destSubdir" -ForegroundColor Green
        }
        
        # Copy all .blade.php files in subdirectory
        Get-ChildItem -Path $sourceSubdir -Filter "*.blade.php" -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Substring($sourceSubdir.Length + 1)
            $destFile = Join-Path $destSubdir $relativePath
            
            # Create parent directory if needed
            $destFileDir = Split-Path $destFile -Parent
            if (-not (Test-Path $destFileDir)) {
                New-Item -ItemType Directory -Path $destFileDir -Force | Out-Null
            }
            
            Copy-AndUpdateFile -SourceFile $_.FullName -DestFile $destFile
        }
    }
}

Write-Host "`nAssistant Warden views created successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run migrations: php artisan migrate" -ForegroundColor White
Write-Host "2. Review the created views in: $destDir" -ForegroundColor White
Write-Host "3. Test login with role_id=2 (Assistant Warden)" -ForegroundColor White
