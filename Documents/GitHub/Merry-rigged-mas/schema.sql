-- Christmas Lights Voting App Database Schema
-- Compatible with Cloudflare D1

-- Houses table
CREATE TABLE IF NOT EXISTS houses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_the_one INTEGER NOT NULL DEFAULT 0 CHECK (is_the_one IN (0, 1)),
    votes INTEGER NOT NULL DEFAULT 0 CHECK (votes >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    house_id INTEGER NOT NULL,
    is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_houses_votes ON houses(votes DESC);
CREATE INDEX IF NOT EXISTS idx_houses_is_the_one ON houses(is_the_one);
CREATE INDEX IF NOT EXISTS idx_messages_house_id ON messages(house_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_system ON messages(is_system);

-- Create triggers to update timestamps
CREATE TRIGGER IF NOT EXISTS update_houses_timestamp 
    AFTER UPDATE ON houses
    BEGIN
        UPDATE houses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Security: Prevent deletion of the special house (House #7)
CREATE TRIGGER IF NOT EXISTS prevent_special_house_deletion
    BEFORE DELETE ON houses
    WHEN OLD.is_the_one = 1
    BEGIN
        SELECT RAISE(FAIL, 'Cannot delete the special house');
    END;