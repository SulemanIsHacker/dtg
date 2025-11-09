# Delete Function Fix - Ambiguous Column Reference

## Issue
The `delete_purchase_request_admin` function was failing with the error:
```
Database error: column reference "user_auth_code_id" is ambiguous
```

## Root Cause
The function was using `user_auth_code_id` without table aliases, causing ambiguity since this column exists in multiple tables (`product_codes`, `purchase_requests`, etc.).

## Solution
Created a new migration file `20250115000033_fix_delete_function_ambiguous_column.sql` that:
1. Drops the problematic function
2. Recreates it with proper table aliases (`pc.user_auth_code_id`)
3. Ensures all column references are unambiguous

## How to Apply the Fix

### Option 1: Manual Database Update (Recommended)
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250115000033_fix_delete_function_ambiguous_column.sql`
4. Execute the SQL

### Option 2: Using Supabase CLI (if available)
```bash
cd supabase
npx supabase db push --linked
```

## What the Fix Does
- **Before**: `WHERE user_auth_code_id = user_auth_code_id` (ambiguous)
- **After**: `WHERE pc.user_auth_code_id = user_auth_code_id` (clear table reference)

## Testing the Fix
After applying the migration:
1. Go to Admin Panel → Product Codes
2. Try deleting a purchase request (click the red trash icon on a user's request card)
3. The deletion should now work without the ambiguous column error

## Expected Behavior
- **Success**: Purchase request and all associated product codes are deleted
- **Error Prevention**: Cannot delete if any product codes are approved
- **Clear Messages**: Proper success/error messages with details

The delete functionality should now work correctly for both individual product codes and entire purchase requests.

