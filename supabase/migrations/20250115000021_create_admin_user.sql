-- Create admin user and assign admin role
-- This creates the admin user toolsystorecontact@gmail.com with password admin123

-- Simple approach: Just assign admin role to existing user or create if needed
-- This is safer and avoids auth.users table conflicts

-- Check if user exists and assign admin role
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Try to find existing user by email
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'toolsystorecontact@gmail.com';
    
    -- If user exists, assign admin role
    IF admin_user_id IS NOT NULL THEN
        -- Check if role already exists
        IF NOT EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = admin_user_id AND role = 'admin'
        ) THEN
            INSERT INTO public.user_roles (user_id, role, created_at)
            VALUES (admin_user_id, 'admin', now());
            RAISE NOTICE 'Admin role assigned to existing user: %', admin_user_id;
        ELSE
            RAISE NOTICE 'Admin role already exists for user: %', admin_user_id;
        END IF;
    ELSE
        RAISE NOTICE 'User toolsystorecontact@gmail.com not found. Please create the user first through Supabase Auth.';
    END IF;
END $$;

-- Simple function to assign admin role to existing users
CREATE OR REPLACE FUNCTION public.assign_admin_role(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Find user by email
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- If user exists, assign admin role
    IF admin_user_id IS NOT NULL THEN
        -- Check if role already exists
        IF NOT EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = admin_user_id AND role = 'admin'
        ) THEN
            INSERT INTO public.user_roles (user_id, role, created_at)
            VALUES (admin_user_id, 'admin', now());
            RETURN 'Admin role assigned to: ' || user_email;
        ELSE
            RETURN 'Admin role already exists for: ' || user_email;
        END IF;
    ELSE
        RETURN 'User not found: ' || user_email || '. Please create the user first through Supabase Auth.';
    END IF;
END;
$$;

-- Call the function to assign admin role
SELECT public.assign_admin_role('toolsystorecontact@gmail.com');
