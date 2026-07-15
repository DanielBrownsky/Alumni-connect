-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
ON messages
FOR SELECT
TO authenticated
USING (
  sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR receiver_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  AND is_deleted = FALSE
);

-- Users can insert messages they send
CREATE POLICY "Users can insert messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Users can update messages they sent (for read status)
CREATE POLICY "Users can update received messages"
ON messages
FOR UPDATE
TO authenticated
USING (
  receiver_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  receiver_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Users can delete messages they sent or received
CREATE POLICY "Users can delete own messages"
ON messages
FOR UPDATE
TO authenticated
USING (
  sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR receiver_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR receiver_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
