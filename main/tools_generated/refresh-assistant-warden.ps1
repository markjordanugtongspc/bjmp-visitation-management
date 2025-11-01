# Quick Refresh Script for Assistant Warden Integration
# Run this after making changes to ensure everything is updated

Write-Host "🔄 Refreshing Assistant Warden Integration..." -ForegroundColor Cyan
Write-Host ""

# Clear Laravel caches
Write-Host "Clearing Laravel caches..." -ForegroundColor Yellow
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

Write-Host ""
Write-Host "Building assets..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ Refresh complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Clear your browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "2. Login as Assistant Warden (role_id=2)" -ForegroundColor White
Write-Host "3. Test all navigation and features" -ForegroundColor White
Write-Host "4. Look for the blue floating button (bottom-right)" -ForegroundColor White
Write-Host ""
