-- Replace 'YOUR_USER_ID_HERE' with the actual ID from the previous query
INSERT INTO profiles (user_id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
  'YOUR_USER_ID_HERE',
  'daniel@alumni-connect.com',
  'Admin',
  'User',
  'admin',
  NOW(),
  NOW()
);