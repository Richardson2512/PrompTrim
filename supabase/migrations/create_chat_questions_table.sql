-- Create chat_questions table to store user questions
CREATE TABLE IF NOT EXISTS chat_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources TEXT[] DEFAULT ARRAY[]::TEXT[],
    confidence FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_questions_user_id ON chat_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_questions_created_at ON chat_questions(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE chat_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own chat questions
CREATE POLICY "Users can view own chat questions"
    ON chat_questions FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Service role can insert chat questions
CREATE POLICY "Service role can insert chat questions"
    ON chat_questions FOR INSERT
    WITH CHECK (true);

COMMENT ON TABLE chat_questions IS 'Stores chat questions asked by users in the documentation assistant';

