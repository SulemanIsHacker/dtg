-- Verify and Fix Admin Role for Daily Tech Global
-- Run this in Supabase SQL Editor to check if admin role is properly assigned

-- Step 0: Remove old admin user if it exists
DELETE FROM public.user_roles 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'toolsystorecontact@gmail.com'
);

DELETE FROM auth.users 
WHERE email = 'toolsystorecontact@gmail.com';

-- Step 1: Check if user exists
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at
FROM auth.users u
WHERE u.email = 'admin@dailytechglobal.com';

-- Step 2: Check if user has admin role
SELECT 
    u.id as user_id,
    u.email,
    ur.role,
    ur.created_at as role_created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@dailytechglobal.com';

-- Step 3: If user exists but doesn't have admin role, add it
DO $$
DECLARE
    admin_user_id UUID;
    has_role BOOLEAN;
BEGIN
    -- Get the user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@dailytechglobal.com';
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'User admin@dailytechglobal.com does not exist. Please run create-dtg-admin.sql first.';
        RETURN;
    END IF;
    
    -- Check if admin role exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles 
        WHERE user_id = admin_user_id AND role = 'admin'
    ) INTO has_role;
    
    IF NOT has_role THEN
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (admin_user_id, 'admin', NOW())
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role added successfully for admin@dailytechglobal.com';
    ELSE
        RAISE NOTICE 'User already has admin role.';
    END IF;
END $$;

-- Step 4: Verify the fix
SELECT 
    u.id as user_id,
    u.email,
    ur.role,
    ur.created_at as role_created_at,
    CASE 
        WHEN ur.role = 'admin' THEN '✅ Admin role is assigned'
        ELSE '❌ Admin role is missing'
    END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND ur.role = 'admin'
WHERE u.email = 'admin@dailytechglobal.com';

