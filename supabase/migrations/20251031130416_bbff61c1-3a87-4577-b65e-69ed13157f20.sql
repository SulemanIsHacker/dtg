-- Create Admin User with proper authentication
-- This creates a user in auth.users with the email toolsystorecontact@gmail.com
-- Password: Toolsy@098

-- Step 1: Remove existing user if exists (clean slate)
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Find existing user
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'toolsystorecontact@gmail.com';
    
    IF existing_user_id IS NOT NULL THEN
        -- Delete from user_roles first (foreign key)
        DELETE FROM public.user_roles WHERE user_id = existing_user_id;
        
        -- Delete from auth.users
        DELETE FROM auth.users WHERE id = existing_user_id;
        
        RAISE NOTICE 'Removed existing user';
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
    'toolsystorecontact@gmail.com',
    crypt('Toolsy@098', gen_salt('bf')),
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
    WHERE email = 'toolsystorecontact@gmail.com';
    
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (admin_user_id, 'admin', NOW())
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin user created successfully';
    RAISE NOTICE 'Email: toolsystorecontact@gmail.com';
    RAISE NOTICE 'Password: Toolsy@098';
END $$;