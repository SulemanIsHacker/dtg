-- Create Admin User for Daily Tech Global
-- Run this in Supabase SQL Editor

-- Step 0: Remove old admin user (toolsystorecontact@gmail.com) if it exists
DELETE FROM public.user_roles 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'toolsystorecontact@gmail.com'
);

DELETE FROM auth.users 
WHERE email = 'toolsystorecontact@gmail.com';

-- Step 1: Remove existing new admin user if it exists (to recreate cleanly)
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Find existing user
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'admin@dailytechglobal.com';
    
    IF existing_user_id IS NOT NULL THEN
        -- Delete from user_roles first (foreign key)
        DELETE FROM public.user_roles WHERE user_id = existing_user_id;
        
        -- Delete from auth.users
        DELETE FROM auth.users WHERE id = existing_user_id;
        
        RAISE NOTICE 'Removed existing admin@dailytechglobal.com user';
    END IF;
END $$;

-- Step 2: Create the admin user in auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@dailytechglobal.com',
    crypt('DTG@Admin2024!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Step 3: Add admin role to user_roles table
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the newly created user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@dailytechglobal.com';
    
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (admin_user_id, 'admin', NOW())
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin user created successfully';
    RAISE NOTICE 'Email: admin@dailytechglobal.com';
    RAISE NOTICE 'Password: DTG@Admin2024!';
END $$;

-- Step 4: Verify the user was created successfully
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    ur.role,
    ur.created_at as role_created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@dailytechglobal.com';

-- Login Credentials:
-- Email: admin@dailytechglobal.com
-- Password: DTG@Admin2024!

