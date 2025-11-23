-- Update existing houses and add new ones with Jeroboam Loop addresses

-- First, let's update existing house addresses to the new format
UPDATE houses SET address = '[1] Jeroboam Loop' WHERE id = 1;
UPDATE houses SET address = '[3] Jeroboam Loop' WHERE id = 3;
UPDATE houses SET address = '[7] Jeroboam Loop' WHERE id = 7;
UPDATE houses SET address = '[12] Jeroboam Loop' WHERE id = 12;
UPDATE houses SET address = '[15] Jeroboam Loop' WHERE id = 15;

-- Add missing houses that we have photos for
INSERT OR REPLACE INTO houses (id, address, description, image_url, is_the_one, votes) VALUES
(2, '[2] Jeroboam Loop', 'Elegant white icicle lights with a charming snowman family display.', '/api/photo/house-2-1763889458328.png', 0, 0),
(4, '[4] Jeroboam Loop', 'Classic red and green bulbs with a beautiful star topper.', '/api/photo/house-4-1763889461478.png', 0, 0),
(5, '[5] Jeroboam Loop', 'Festive multicolor display with animated reindeer and sleigh.', 'https://picsum.photos/400/300?random=20', 0, 0),
(6, '[6] Jeroboam Loop', 'Cozy warm white lights creating a winter wonderland scene.', '/api/photo/house-6-1763889465848.png', 0, 0),
(8, '[8] Jeroboam Loop', 'Spectacular candy cane archway with twinkling pathway lights.', '/api/photo/house-8-1763889469380.png', 0, 0),
(9, '[9] Jeroboam Loop', 'Impressive LED projection show with dancing snowflakes.', '/api/photo/house-9-1763889471230.png', 0, 0),
(10, '[10] Jeroboam Loop', 'Traditional Christmas tree display with golden ornaments.', '/api/photo/house-10-1763889473198.png', 0, 0),
(11, '[11] Jeroboam Loop', 'Modern blue and silver theme with elegant icicle effects.', '/api/photo/house-11-1763889476761.png', 0, 0),
(55, '[55] Jeroboam Loop', 'The house at the end of the loop with a magical winter forest display.', '/api/photo/house-55-1763889475004.png', 0, 0);

-- Update existing house descriptions to be more engaging
UPDATE houses SET description = 'A modest display with inflatable reindeer and warm pathway lights. Cute and welcoming!' WHERE id = 1;
UPDATE houses SET description = 'High concept minimal white lights creating an elegant winter aesthetic.' WHERE id = 3;
UPDATE houses SET description = 'A SYMPHONY OF ILLUMINATION! 50,000 synchronized lights, animatronics, and pure holiday magic.' WHERE id = 7;
UPDATE houses SET description = 'Creative Halloween-Christmas fusion with Santa hat wearing skeletons. Unique and memorable!' WHERE id = 12;
UPDATE houses SET description = 'High-tech laser light show that creates dazzling patterns. Very modern!' WHERE id = 15;