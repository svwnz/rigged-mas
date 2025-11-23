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

-- Insert sample houses data
INSERT OR IGNORE INTO houses (id, address, description, image_url, is_the_one, votes) VALUES
(1, '101 Candy Cane Lane', 'A modest display with some inflatable reindeer. Cute, but maybe too safe?', 'https://picsum.photos/400/300?random=1', 0, 15),
(3, '103 Mistletoe Ave', 'High concept minimal white lights. Very chic, very boring.', 'https://picsum.photos/400/300?random=2', 0, 8),
(7, '107 Jingle Bell Rock', 'A SYMPHONY OF ILLUMINATION. 50,000 synchronized lights, animatronics, and pure holiday spirit.', 'https://picsum.photos/400/300?random=7', 1, 1420),
(12, '112 Frosty Way', 'They left their Halloween decorations up and put Santa hats on skeletons.', 'https://picsum.photos/400/300?random=4', 0, 22),
(15, '115 Nutcracker Blvd', 'Lots of lasers. Blinds the neighbors. A bit aggressive.', 'https://picsum.photos/400/300?random=5', 0, 18);

-- Insert sample messages
INSERT OR IGNORE INTO messages (id, name, text, house_id, is_system) VALUES
(1, 'Santa''s Little Helper', 'House #7 can be seen from space. Literally. ISS confirmed.', 7, 0),
(2, 'Karen from HOA', 'I usually complain about brightness, but House #7 is tasteful art.', 7, 0),
(3, 'Anonymous', 'House #3 tried, but #7 has better synchronization.', 3, 0),
(4, 'The Grinch', 'Even I can''t hate the display at #7. My heart grew 3 sizes.', 7, 0),
(5, 'Sparky', 'I like the skeletons at #12!', 12, 0),
(6, 'System Admin', 'Daily Reminder: House #7 uses 100% renewable reindeer energy.', 7, 1);

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