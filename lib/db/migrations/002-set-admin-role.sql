-- Set a13158y@gmail.com as admin
-- This ensures the admin role is applied to existing users
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'a13158y@gmail.com';

