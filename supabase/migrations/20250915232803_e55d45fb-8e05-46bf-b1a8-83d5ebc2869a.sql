-- First migration: Add admin role to enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';