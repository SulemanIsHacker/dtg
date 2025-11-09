-- Simple Admin User Creation
-- Run this in Supabase SQL Editor

-- Step 1: Remove existing user if it exists
DELETE FROM public.user_roles 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'toolsystorecontact@gmail.com'
);

DELETE FROM auth.users 
WHERE email = 'toolsystorecontact@gmail.com';

-- Step 2: Create the admin user
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
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'toolsystorecontact@gmail.com',
    crypt('Toolsy@098', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now()
);

-- Step 3: Add admin role
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT id, 'admin', now()
FROM auth.users 
WHERE email = 'toolsystorecontact@gmail.com';

-- Step 4: Verify the user was created
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'toolsystorecontact@gmail.com';
