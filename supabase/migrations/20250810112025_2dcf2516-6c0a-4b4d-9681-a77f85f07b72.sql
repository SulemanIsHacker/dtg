
-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Enable RLS on product_comparison_values table
ALTER TABLE public.product_comparison_values ENABLE ROW LEVEL SECURITY;

-- Fix overly permissive RLS policies
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
DROP POLICY IF EXISTS "Admin can manage product images" ON public.products;
DROP POLICY IF EXISTS "Admin can manage product videos" ON public.product_videos;
DROP POLICY IF EXISTS "Admin can manage pricing plans" ON public.pricing_plans;
DROP POLICY IF EXISTS "Admin can manage comparison features" ON public.comparison_features;

-- Create proper role-based policies for products
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create proper role-based policies for product_images
CREATE POLICY "Admins can manage product images"
ON public.product_images
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create proper role-based policies for product_videos
CREATE POLICY "Admins can manage product videos"
ON public.product_videos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create proper role-based policies for pricing_plans
CREATE POLICY "Admins can manage pricing plans"
ON public.pricing_plans
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create proper role-based policies for comparison_features
CREATE POLICY "Admins can manage comparison features"
ON public.comparison_features
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create policies for product_comparison_values
CREATE POLICY "Product comparison values are viewable by everyone"
ON public.product_comparison_values
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product comparison values"
ON public.product_comparison_values
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create policies for user_roles (only admins can manage roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create audit log table for security monitoring
CREATE TABLE public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    _action TEXT,
    _table_name TEXT DEFAULT NULL,
    _record_id TEXT DEFAULT NULL,
    _old_values JSONB DEFAULT NULL,
    _new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.admin_audit_log (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (auth.uid(), _action, _table_name, _record_id, _old_values, _new_values);
$$;

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS customer_photo_url TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS customer_photo_path TEXT;