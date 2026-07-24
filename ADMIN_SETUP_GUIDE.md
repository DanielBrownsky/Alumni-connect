# Admin Account Setup Guide

## 🔐 Setting Up Your Admin Account

Follow these steps to create your admin account for the Alumni Connect platform.

### Step 1: Update Your Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `dbuldrkhpmrtnprkexjg`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL from `supabase/setup_admin.sql`
6. **Important**: Replace `'admin@alumni-connect.com'` with your actual admin email
7. Click **Run** to execute the SQL

### Step 2: Create Your Admin Account

You have two options to create your admin account:

#### Option A: Through Supabase Dashboard (Recommended)

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **Add User** > **Create New User**
3. Enter your email (the same one you used in the SQL script)
4. Set a secure password
5. Click **Auto Confirm User** (this skips email verification)
6. Click **Create User**

#### Option B: Through the Application

1. Go to `http://localhost:3000/auth/signup`
2. Sign up with your admin email
3. The system will automatically assign the admin role based on your email
4. You'll need to verify your email unless you disabled email confirmation

### Step 3: Set Your Admin Role (if Option B)

If you used Option B and the role wasn't automatically set:

1. In Supabase Dashboard, go to **Table Editor** > **profiles**
2. Find your user by email
3. Click on the `role` field
4. Change it from `student` to `admin`
5. Click **Save**

### Step 4: Access Your Admin Dashboard

1. Go to `http://localhost:3000/auth/admin-signin`
2. Enter your admin email and password
3. Click **Admin Sign In**
4. You'll be redirected to `/dashboard/admin`

## 🔧 Troubleshooting

### Issue: "Access denied. Admin privileges required."

**Solution**: Make sure your profile has the `admin` role in the database:
1. Go to Supabase Dashboard > Table Editor > profiles
2. Find your user and check the role column
3. Update it to `admin` if needed

### Issue: SQL script fails with "column does not exist"

**Solution**: Your profiles table might not have the structure yet. Run this first:

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
```

### Issue: Can't access admin dashboard

**Solution**: Check that:
1. You're using the admin sign-in page (`/auth/admin-signin`)
2. Your user has the admin role in the database
3. You're using the correct email and password

## 🎯 Quick Setup Checklist

- [ ] Updated database schema with admin role
- [ ] Created admin account in Supabase
- [ ] Set role to 'admin' in profiles table
- [ ] Can access `/auth/admin-signin`
- [ ] Successfully logged into admin dashboard
- [ ] Can see admin statistics and user management

## 🔒 Security Notes

- **Never share your admin credentials**
- **Use a strong, unique password** for your admin account
- **Regularly review user access** in the admin dashboard
- **Monitor for suspicious activity** in your Supabase logs
- **Keep your admin email private** and separate from personal accounts

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase logs for error messages
2. Verify your database schema matches the expected structure
3. Ensure your environment variables are correctly set
4. Try accessing the regular sign-in page first to test basic authentication

## 🚀 Next Steps After Setup

Once your admin account is working:
1. Review the admin dashboard features
2. Set up user management policies
3. Configure platform settings
4. Monitor user registrations
5. Set up email notifications for important events