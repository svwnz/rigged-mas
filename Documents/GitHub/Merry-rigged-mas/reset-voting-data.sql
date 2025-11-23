-- Reset voting data and comments
-- This script clears all votes and messages while preserving house data

-- Reset all vote counts to zero
UPDATE houses SET votes = 0;

-- Clear all messages and comments
DELETE FROM messages;

-- Verify reset (optional check commands)
-- SELECT COUNT(*) as houses_with_votes FROM houses WHERE votes > 0;
-- SELECT COUNT(*) as total_messages FROM messages;