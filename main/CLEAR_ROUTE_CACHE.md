# Route Cache Clear Instructions

If you're experiencing 404 errors for routes that are correctly defined in `routes/web.php`, you need to clear Laravel's route cache.

## Quick Fix

Run this command in your terminal:

```bash
php artisan route:clear
```

Or if you're in production and want to rebuild the cache:

```bash
php artisan route:clear
php artisan route:cache
```

## Why This Happens

Laravel caches routes for performance. When you add or modify routes, the cache can become stale and return 404 errors even though the routes are correctly defined.

## Affected Routes

The following routes may need cache clearing:
- `/visitor/conjugal-visits/verify-inmate-by-id`
- `/visitor/conjugal-visits/check-eligibility`
- `/visitor/conjugal-visits/register`
- `/visitor/conjugal-visits/request-visit`
- `/visitor/conjugal-visits/supervision`

## Verification

After clearing the cache, you can verify routes are registered by running:

```bash
php artisan route:list --path=visitor/conjugal-visits
```

This will show all conjugal visit routes and confirm they're properly registered.

