-- Add market_unlocked column to user_progress table
-- This enables the Community Market unlock feature

-- Add the column (defaults to false for existing users)
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS market_unlocked BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_progress_market_unlocked 
ON user_progress(market_unlocked);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_progress' 
AND column_name = 'market_unlocked';
