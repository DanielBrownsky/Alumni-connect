-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  donor_email TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  donation_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all donations" ON donations
  FOR SELECT USING (true);

CREATE POLICY "Users can insert donations" ON donations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = donor_id
    )
  );

CREATE POLICY "Users can update own donations" ON donations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = donor_id
    )
  );

-- Grant permissions
GRANT ALL ON donations TO authenticated;
GRANT SELECT ON donations TO anon;
