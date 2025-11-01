# PowerShell Script to Fix Assistant Warden Views
# This script fixes the malformed directory names and recreates views properly

Write-Host "Fixing Assistant Warden Views..." -ForegroundColor Cyan

# Remove malformed directories and recreate properly
$destDir = "resources\views\assistant_warden"

# Remove existing malformed structure
if (Test-Path $destDir) {
    Remove-Item -Path $destDir -Recurse -Force
    Write-Host "Removed existing malformed views" -ForegroundColor Yellow
}

# Create clean directory structure
New-Item -ItemType Directory -Path $destDir -Force | Out-Null
New-Item -ItemType Directory -Path "$destDir\inmates" -Force | Out-Null
New-Item -ItemType Directory -Path "$destDir\officers" -Force | Out-Null
New-Item -ItemType Directory -Path "$destDir\visitors" -Force | Out-Null
New-Item -ItemType Directory -Path "$destDir\supervision" -Force | Out-Null

Write-Host "Created clean directory structure" -ForegroundColor Green

# Function to copy and update file content
function Copy-AndUpdateFile {
    param (
        [string]$SourceFile,
        [string]$DestFile
    )
    
    if (-not (Test-Path $SourceFile)) {
        Write-Host "Warning: Source file not found: $SourceFile" -ForegroundColor Yellow
        return
    }
    
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

# Copy dashboard
Copy-AndUpdateFile -SourceFile "resources\views\warden\dashboard.blade.php" -DestFile "$destDir\dashboard.blade.php"

# Copy inmates
Copy-AndUpdateFile -SourceFile "resources\views\warden\inmates\inmates.blade.php" -DestFile "$destDir\inmates\inmates.blade.php"

# Copy officers
Copy-AndUpdateFile -SourceFile "resources\views\warden\officers\officers.blade.php" -DestFile "$destDir\officers\officers.blade.php"

# Copy visitors
Copy-AndUpdateFile -SourceFile "resources\views\warden\visitors\visitors.blade.php" -DestFile "$destDir\visitors\visitors.blade.php"
Copy-AndUpdateFile -SourceFile "resources\views\warden\visitors\requests.blade.php" -DestFile "$destDir\visitors\requests.blade.php"

# Copy supervision
Copy-AndUpdateFile -SourceFile "resources\views\warden\supervision\supervision.blade.php" -DestFile "$destDir\supervision\supervision.blade.php"

Write-Host "`nAssistant Warden views fixed successfully!" -ForegroundColor Green
Write-Host "All routes should now work correctly." -ForegroundColor Cyan
