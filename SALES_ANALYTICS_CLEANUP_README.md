# Sales Analytics Cleanup Guide

This guide explains how to remove all dummy/test data from the sales analytics system.

## Overview

The sales analytics system automatically populates data from real user subscriptions and refunds. However, during development and testing, dummy data may have been created. This guide provides multiple options to clean up this data.

## Cleanup Options

### Option 1: Complete Cleanup (Nuclear Option)
**Use this if you want to remove ALL data including legitimate user subscriptions**

**File:** `supabase/migrations/20250115000012_cleanup_dummy_sales_data.sql`

This script will:
- Delete all sales analytics records
- Delete all user subscriptions
- Delete all refund requests
- Delete all admin action logs
- Reset the entire system to a clean state

**⚠️ WARNING: This will remove ALL data. Only use if you're sure you want to start completely fresh.**

### Option 2: Selective Cleanup (Recommended)
**Use this to remove only sales analytics data while preserving user subscriptions**

**File:** `supabase/migrations/20250115000013_selective_cleanup_sales_analytics.sql`

This script will:
- Delete only sales analytics records
- Preserve user subscriptions
- Clear related admin logs
- Keep the system functional for real users

### Option 3: Direct SQL Execution
**Use this for immediate cleanup without migrations**

**File:** `cleanup-sales-analytics.sql`

This is a simple SQL script that can be run directly in:
- Supabase SQL Editor
- Database client (pgAdmin, DBeaver, etc.)
- Command line tools

## How to Execute Cleanup

### Method 1: Using Supabase Migrations
```bash
# Navigate to your project directory
cd your-project-directory

# Run the migration
npx supabase db push
```

### Method 2: Using Supabase SQL Editor
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `cleanup-sales-analytics.sql`
4. Click "Run" to execute

### Method 3: Using Database Client
1. Connect to your Supabase database
2. Open the `cleanup-sales-analytics.sql` file
3. Execute the script

## Verification

After running any cleanup script, you can verify the results using these functions:

### Check Sales Analytics Status
```sql
SELECT * FROM check_sales_analytics_status();
```

### Verify Clean System
```sql
SELECT * FROM verify_clean_sales_system();
```

### Manual Verification
```sql
-- Check sales analytics
SELECT COUNT(*) as sales_analytics_count FROM sales_analytics;

-- Check user subscriptions
SELECT COUNT(*) as user_subscriptions_count FROM user_subscriptions;

-- Check refund requests
SELECT COUNT(*) as refund_requests_count FROM refund_requests;
```

## Expected Results

After successful cleanup:

### Complete Cleanup
- `sales_analytics`: 0 records
- `user_subscriptions`: 0 records
- `refund_requests`: 0 records
- `admin_action_logs`: 1 record (the cleanup action itself)

### Selective Cleanup
- `sales_analytics`: 0 records
- `user_subscriptions`: Preserved (may have > 0 records)
- `refund_requests`: Preserved (may have > 0 records)
- `admin_action_logs`: 1 record (the cleanup action itself)

## Rebuilding Analytics Data

After cleanup, the sales analytics system will automatically rebuild data when:

1. **New subscriptions are created** - Triggers will automatically populate analytics
2. **Subscriptions change status** - Active/expired counts will be updated
3. **Refunds are processed** - Refund data will be tracked
4. **Manual backfill is run** - Use the backfill function in the admin panel

### Manual Backfill
If you have existing subscriptions and want to rebuild analytics:

1. Go to Admin Panel → Sales Analytics tab
2. Click "Run Analytics Backfill"
3. Wait for completion message
4. Verify data in the analytics dashboard

## Troubleshooting

### If cleanup fails:
1. Check database permissions
2. Ensure you're connected to the correct database
3. Verify table names and structure
4. Check for foreign key constraints

### If data reappears:
1. Check for active triggers
2. Verify no background processes are running
3. Ensure cleanup was applied to the correct environment

### If analytics don't rebuild:
1. Check trigger functions are enabled
2. Verify subscription data exists
3. Run manual backfill
4. Check admin panel for errors

## Safety Notes

- **Always backup your database** before running cleanup scripts
- **Test on a development environment** first
- **Verify the correct environment** before executing
- **Keep a record** of what was cleaned up

## Support

If you encounter issues:
1. Check the Supabase logs
2. Verify database connectivity
3. Review the migration files
4. Contact your database administrator

---

**Last Updated:** January 15, 2025
**Version:** 1.0
