-- Remove Old Admin User (toolsystorecontact@gmail.com)
-- Run this in Supabase SQL Editor

-- Step 1: Remove old admin user from user_roles table
DELETE FROM public.user_roles 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'toolsystorecontact@gmail.com'
);

-- Step 2: Remove old admin user from auth.users table
DELETE FROM auth.users 
WHERE email = 'toolsystorecontact@gmail.com';

-- Step 3: Verify the old admin was removed
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Old admin user successfully removed'
        ELSE '❌ Old admin user still exists'
    END as status
FROM auth.users 
WHERE email = 'toolsystorecontact@gmail.com';

-- Step 4: Verify the new admin exists
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    ur.role,
    CASE 
        WHEN ur.role = 'admin' THEN '✅ New admin user exists with admin role'
        ELSE '❌ New admin user exists but role is missing'
    END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND ur.role = 'admin'
WHERE u.email = 'admin@dailytechglobal.com';





