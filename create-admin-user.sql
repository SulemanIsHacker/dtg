-- Create Admin User with Full Privileges
-- Run this in Supabase SQL Editor

-- Step 1: Remove existing user if it exists
DO $$
BEGIN
    -- Delete from user_roles table first (due to foreign key constraint)
    DELETE FROM public.user_roles 
    WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE email = 'toolsystorecontact@gmail.com'
    );
    
    -- Delete from auth.users table
    DELETE FROM auth.users 
    WHERE email = 'toolsystorecontact@gmail.com';
    
    RAISE NOTICE 'Removed existing user if it existed';
END $$;

-- Step 2: Create the new admin user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- instance_id
    gen_random_uuid(), -- id
    'authenticated', -- aud
    'authenticated', -- role
    'toolsystorecontact@gmail.com', -- email
    crypt('Toolsy@098', gen_salt('bf')), -- encrypted_password
    now(), -- email_confirmed_at
    null, -- invited_at
    '', -- confirmation_token
    null, -- confirmation_sent_at
    '', -- recovery_token
    null, -- recovery_sent_at
    '', -- email_change_token_new
    '', -- email_change
    null, -- email_change_sent_at
    null, -- last_sign_in_at
    '{"provider": "email", "providers": ["email"]}', -- raw_app_meta_data
    '{}', -- raw_user_meta_data
    false, -- is_super_admin
    now(), -- created_at
    now(), -- updated_at
    null, -- phone
    null, -- phone_confirmed_at
    '', -- phone_change
    '', -- phone_change_token
    null, -- phone_change_sent_at
    '', -- email_change_token_current
    0, -- email_change_confirm_status
    null, -- banned_until
    '', -- reauthentication_token
    null, -- reauthentication_sent_at
    false, -- is_sso_user
    null -- deleted_at
);

-- Step 3: Get the user ID for the newly created user
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'toolsystorecontact@gmail.com';
    
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (admin_user_id, 'admin', now())
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
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
WHERE u.email = 'toolsystorecontact@gmail.com';

-- Step 5: Note about privileges
-- In Supabase, privileges are handled through Row Level Security (RLS) policies
-- The admin role in user_roles table will be used by RLS policies to grant access
-- No need to grant direct database privileges as Supabase handles this automatically

-- Step 6: Create a simple test to verify admin access
DO $$
DECLARE
    admin_user_id UUID;
    has_admin_role BOOLEAN;
BEGIN
    -- Get the user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'toolsystorecontact@gmail.com';
    
    -- Check if user has admin role
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = admin_user_id AND role = 'admin'
    ) INTO has_admin_role;
    
    IF has_admin_role THEN
        RAISE NOTICE 'SUCCESS: Admin user created successfully with full privileges';
        RAISE NOTICE 'Email: toolsystorecontact@gmail.com';
        RAISE NOTICE 'Password: Toolsy@098';
        RAISE NOTICE 'User ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'ERROR: Failed to create admin user';
    END IF;
END $$;
