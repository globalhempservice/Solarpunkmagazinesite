-- ================================================
-- 🌍 COMPLETE SWAP SHOP SETUP - RUN THIS FILE
-- ================================================
-- This file combines geolocation setup + 50 test items
-- Run this ONCE in Supabase SQL Editor
-- ================================================

-- ================================================
-- PART 1: ADD GEOLOCATION COLUMNS
-- ================================================

ALTER TABLE swap_items 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_swap_items_geolocation 
ON swap_items(latitude, longitude);

COMMENT ON COLUMN swap_items.latitude IS 'Latitude for globe visualization (-90 to 90)';
COMMENT ON COLUMN swap_items.longitude IS 'Longitude for globe visualization (-180 to 180)';

-- ================================================
-- PART 2: POPULATE 50 DIVERSE ITEMS
-- ================================================

DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- Get first user from auth.users
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  IF sample_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create a user first by signing up in the app.';
    RETURN;
  END IF;

  RAISE NOTICE '👤 Using user_id: %', sample_user_id;

  -- CLOTHING (15 items)
  INSERT INTO swap_items (user_id, title, description, category, condition, hemp_inside, hemp_percentage, country, city, latitude, longitude, willing_to_ship, story, years_in_use) VALUES
  (sample_user_id, 'Vintage Hemp Denim Jacket', 'Classic 90s hemp-cotton blend denim jacket with embroidered patches. Fits like a dream and only gets better with age.', 'clothing', 'well_loved', true, 55, 'United States', 'Portland', 45.5152, -122.6784, true, 'Found this at a thrift shop in Portland 5 years ago. It has been my go-to festival jacket ever since!', 5),
  (sample_user_id, 'Hemp Yoga Pants - Size M', 'Super stretchy and breathable hemp-spandex yoga pants. Black with subtle leaf pattern.', 'clothing', 'good', true, 70, 'Canada', 'Vancouver', 49.2827, -123.1207, true, 'Bought these at a sustainable fashion pop-up. They are incredibly comfortable but I sized down recently.', 2),
  (sample_user_id, 'Organic Hemp T-Shirt - Cream', 'Soft, breathable hemp t-shirt in natural cream color. Unisex fit, size L.', 'clothing', 'like_new', true, 100, 'Netherlands', 'Amsterdam', 52.3676, 4.9041, true, 'Impulse buy at a hemp store. Only worn twice, just not my style.', 1),
  (sample_user_id, 'Hemp Linen Summer Dress', 'Flowy midi-length dress in sage green. Hemp-linen blend, perfect for summer. Has pockets!', 'clothing', 'good', true, 65, 'France', 'Lyon', 45.7640, 4.8357, false, 'My favorite summer dress for 3 years, but I am moving to colder climate.', 3),
  (sample_user_id, 'Hand-Dyed Hemp Hoodie', 'Unique tie-dye hemp hoodie in blues and purples. One-of-a-kind artisan piece.', 'clothing', 'good', true, 80, 'Australia', 'Byron Bay', -28.6474, 153.6020, true, 'Made by a local artist in Byron Bay. Vibrant colors, super cozy.', 2),
  (sample_user_id, 'Hemp Canvas Work Pants', 'Durable work pants with reinforced knees. Olive green hemp canvas. Size 32x32.', 'clothing', 'well_loved', true, 90, 'Germany', 'Berlin', 52.5200, 13.4050, true, 'These pants survived 4 years of gardening and construction work. Indestructible!', 4),
  (sample_user_id, 'Hemp Kimono Robe - Black', 'Lightweight hemp kimono-style robe. Perfect for lounging or as a beach cover-up.', 'clothing', 'like_new', true, 100, 'Japan', 'Kyoto', 35.0116, 135.7681, true, 'Beautiful craftsmanship from a Kyoto artisan. Never worn, gift from friend.', 0),
  (sample_user_id, 'Vintage Hemp Overalls', 'Classic farmer overalls in natural hemp. Adjustable straps, multiple pockets.', 'clothing', 'vintage', true, 75, 'United Kingdom', 'Bristol', 51.4545, -2.5879, true, 'These are probably from the 1970s! Found in my grandparents attic.', 50),
  (sample_user_id, 'Hemp Fleece Jacket', 'Warm fleece-lined hemp jacket. Dark brown, size M. Great for cold weather.', 'clothing', 'good', true, 60, 'Sweden', 'Stockholm', 59.3293, 18.0686, true, 'Kept me warm through 2 Swedish winters. Upgrading to down jacket.', 2),
  (sample_user_id, 'Hemp Beach Shorts - Turquoise', 'Quick-dry hemp shorts perfect for beach or swimming. Turquoise with coconut button fly.', 'clothing', 'like_new', true, 85, 'Costa Rica', 'Santa Teresa', 9.6500, -85.1700, true, 'Bought for surf trip but barely used. Super comfortable and dry fast!', 1),
  (sample_user_id, 'Hemp Knit Sweater - Gray', 'Chunky knit hemp sweater in heather gray. Warm but breathable. Size L.', 'clothing', 'good', true, 70, 'Ireland', 'Galway', 53.2707, -9.0568, false, 'Hand-knitted by local artisan in Galway. Beautiful texture.', 3),
  (sample_user_id, 'Hemp Cargo Shorts - Khaki', 'Multi-pocket cargo shorts. Perfect for hiking and travel. Size 34.', 'clothing', 'well_loved', true, 80, 'New Zealand', 'Wellington', -41.2865, 174.7762, true, 'These shorts have hiked through 15 national parks. Ready for their next adventure!', 5),
  (sample_user_id, 'Hemp Business Shirt - White', 'Professional button-down shirt. Crisp white hemp-cotton blend. Size L, slim fit.', 'clothing', 'like_new', true, 50, 'Singapore', 'Singapore', 1.3521, 103.8198, true, 'Bought for job interview. Only worn once. Wrinkle-resistant.', 0),
  (sample_user_id, 'Hemp Pajama Set - Navy', 'Comfortable two-piece pajama set. Navy blue with white piping. Size M.', 'clothing', 'good', true, 75, 'South Korea', 'Seoul', 37.5665, 126.9780, true, 'Incredibly soft sleepwear. Switching to silk so passing these along.', 2),
  (sample_user_id, 'Hemp Festival Pants - Rainbow', 'Wide-leg hemp pants with rainbow stripe pattern. Perfect for festivals!', 'clothing', 'good', true, 90, 'Thailand', 'Chiang Mai', 18.7883, 98.9853, true, 'Bought at a market in Chiang Mai. These pants have seen many sunrises.', 3);

  -- ACCESSORIES (12 items)
  INSERT INTO swap_items (user_id, title, description, category, condition, hemp_inside, hemp_percentage, country, city, latitude, longitude, willing_to_ship, story, years_in_use) VALUES
  (sample_user_id, 'Hemp Backpack - 30L', 'Durable travel backpack with laptop sleeve. Natural hemp color with leather accents.', 'accessories', 'well_loved', true, 85, 'Nepal', 'Kathmandu', 27.7172, 85.3240, true, 'This backpack trekked the Annapurna Circuit with me. Some wear but tons of life left!', 4),
  (sample_user_id, 'Hemp Tote Bag - Large', 'Oversized tote bag perfect for groceries or beach. Heavy-duty hemp canvas.', 'accessories', 'good', true, 100, 'Portugal', 'Lisbon', 38.7223, -9.1393, true, 'My go-to shopping bag for 3 years. Holds everything!', 3),
  (sample_user_id, 'Hemp Wallet - Tri-Fold', 'Classic tri-fold wallet with multiple card slots. Brown hemp with snap closure.', 'accessories', 'like_new', true, 100, 'Mexico', 'Oaxaca', 17.0732, -96.7266, true, 'Handmade in Oaxaca. Beautiful stitching.', 1),
  (sample_user_id, 'Hemp Sun Hat - Wide Brim', 'Woven hemp sun hat with adjustable chin strap. Natural color, unisex.', 'accessories', 'good', true, 90, 'Morocco', 'Marrakech', 31.6295, -7.9811, false, 'Kept me cool through Sahara desert trip.', 2),
  (sample_user_id, 'Hemp Belt - Brown', 'Braided hemp belt with metal buckle. Adjustable, fits 30-36 waist.', 'accessories', 'well_loved', true, 100, 'Italy', 'Florence', 43.7696, 11.2558, true, 'Bought at a leather market but its actually hemp! Very durable.', 6),
  (sample_user_id, 'Hemp Camera Strap', 'Padded camera strap for DSLR. Black hemp with quick-release clips.', 'accessories', 'like_new', true, 95, 'Iceland', 'Reykjavik', 64.1466, -21.9426, true, 'Upgraded my camera. Comfortable for long shoots.', 1),
  (sample_user_id, 'Hemp Yoga Mat Bag', 'Cylindrical bag with adjustable strap. Purple hemp canvas.', 'accessories', 'good', true, 100, 'India', 'Goa', 15.2993, 74.1240, true, 'Made in India by women-owned cooperative.', 2),
  (sample_user_id, 'Hemp Watch Strap', 'Replacement watch strap for 20mm watches. Olive green hemp.', 'accessories', 'like_new', true, 100, 'Switzerland', 'Geneva', 46.2044, 6.1432, true, 'Changed my mind on the color. Never worn.', 0),
  (sample_user_id, 'Hemp Messenger Bag', 'Crossbody messenger bag with multiple compartments. Charcoal gray.', 'accessories', 'well_loved', true, 80, 'Spain', 'Barcelona', 41.3874, 2.1686, true, 'My daily commute bag for 5 years.', 5),
  (sample_user_id, 'Hemp Scarf - Striped', 'Lightweight scarf in navy and white stripes. Hemp-cotton blend.', 'accessories', 'good', true, 65, 'Denmark', 'Copenhagen', 55.6761, 12.5683, true, 'Scandinavian minimalist design.', 2),
  (sample_user_id, 'Hemp Keychain Lanyard', 'Simple braided keychain lanyard. Natural hemp with metal clasp.', 'accessories', 'like_new', true, 100, 'Brazil', 'São Paulo', -23.5505, -46.6333, true, 'Made at a craft fair. Gets softer with use.', 1),
  (sample_user_id, 'Hemp Phone Case - iPhone', 'Protective case for iPhone 12/13. Tan hemp exterior.', 'accessories', 'good', true, 70, 'Poland', 'Warsaw', 52.2297, 21.0122, true, 'Upgraded my phone so no longer fits.', 2);

  -- HOME GOODS (10 items)
  INSERT INTO swap_items (user_id, title, description, category, condition, hemp_inside, hemp_percentage, country, city, latitude, longitude, willing_to_ship, story, years_in_use) VALUES
  (sample_user_id, 'Hemp Throw Blanket', 'Cozy throw blanket in natural ivory. 100% hemp.', 'home_goods', 'good', true, 100, 'Belgium', 'Brussels', 50.8503, 4.3517, false, 'Perfect for couch snuggling. Downsizing.', 3),
  (sample_user_id, 'Hemp Pillow Covers - Set of 2', 'Decorative pillow covers in sage green. 18x18 inches.', 'home_goods', 'like_new', true, 70, 'Finland', 'Helsinki', 60.1699, 24.9384, true, 'Scandinavian design. Only used for staging.', 0),
  (sample_user_id, 'Hemp Table Runner', 'Minimalist table runner in charcoal gray. 72 inches long.', 'home_goods', 'good', true, 100, 'Austria', 'Vienna', 48.2082, 16.3738, true, 'Used for dinner parties. Some wine stains!', 4),
  (sample_user_id, 'Hemp Curtains - Pair', 'Light-filtering curtain panels. Natural beige, 84 inches.', 'home_goods', 'good', true, 85, 'Norway', 'Oslo', 59.9139, 10.7522, false, 'Redecorating with different colors.', 2),
  (sample_user_id, 'Hemp Bath Towel Set', 'Set of 2 bath towels and 2 hand towels. Charcoal gray.', 'home_goods', 'like_new', true, 90, 'Turkey', 'Istanbul', 41.0082, 28.9784, true, 'Premium quality. Received as gift.', 1),
  (sample_user_id, 'Hemp Kitchen Towels - Set of 4', 'Absorbent kitchen towels. Striped pattern in earth tones.', 'home_goods', 'well_loved', true, 100, 'Greece', 'Athens', 37.9838, 23.7275, true, 'These have dried thousands of dishes!', 5),
  (sample_user_id, 'Hemp Hammock', 'Portable camping hammock. Holds up to 400 lbs.', 'home_goods', 'good', true, 95, 'Colombia', 'Bogotá', 4.7110, -74.0721, true, 'Amazing for camping or backyard.', 3),
  (sample_user_id, 'Hemp Yoga Bolster', 'Cylindrical meditation cushion. Purple hemp cover.', 'home_goods', 'good', true, 80, 'Vietnam', 'Hanoi', 21.0285, 105.8542, false, 'Perfect for restorative yoga.', 2),
  (sample_user_id, 'Hemp Placemat Set', 'Set of 4 rectangular placemats. Woven hemp.', 'home_goods', 'like_new', true, 100, 'Argentina', 'Buenos Aires', -34.6037, -58.3816, true, 'Used once for thanksgiving.', 0),
  (sample_user_id, 'Hemp Rope Basket', 'Coiled rope storage basket. 14 inches diameter.', 'home_goods', 'good', true, 100, 'South Africa', 'Cape Town', -33.9249, 18.4241, true, 'Handmade in Cape Town.', 2);

  -- WELLNESS (8 items)
  INSERT INTO swap_items (user_id, title, description, category, condition, hemp_inside, hemp_percentage, country, city, latitude, longitude, willing_to_ship, story, years_in_use) VALUES
  (sample_user_id, 'Hemp Meditation Cushion', 'Zafu meditation cushion. Black hemp cover, 14 inch.', 'wellness', 'good', true, 100, 'Tibet', 'Lhasa', 29.6500, 91.1000, true, 'Used for daily meditation for 3 years.', 3),
  (sample_user_id, 'Hemp Eye Pillow - Lavender', 'Weighted eye pillow with lavender. Purple hemp silk.', 'wellness', 'like_new', true, 70, 'Chile', 'Santiago', -33.4489, -70.6693, true, 'Perfect for savasana. Prefer unscented.', 1),
  (sample_user_id, 'Hemp Massage Oil Blend', 'Organic hemp seed oil with essential oils. 8oz, unopened.', 'wellness', 'like_new', true, 100, 'Egypt', 'Cairo', 30.0444, 31.2357, true, 'Received as gift.', 0),
  (sample_user_id, 'Hemp Body Lotion - Unscented', 'Natural body lotion. 16oz pump bottle, 75% full.', 'wellness', 'good', true, 85, 'Malaysia', 'Kuala Lumpur', 3.1390, 101.6869, true, 'Great for dry skin.', 1),
  (sample_user_id, 'Hemp Soap Set - 3 Bars', 'Handmade soap. Eucalyptus, lavender, citrus.', 'wellness', 'like_new', true, 60, 'Israel', 'Tel Aviv', 32.0853, 34.7818, true, 'Made by local artisan.', 1),
  (sample_user_id, 'Hemp Heating Pad', 'Microwaveable heating pad. Lavender scented.', 'wellness', 'good', true, 50, 'Russia', 'Moscow', 55.7558, 37.6173, true, 'Perfect for sore muscles.', 2),
  (sample_user_id, 'Hemp Lip Balm - 3 Pack', 'Natural lip balm. Mint, vanilla, unflavored.', 'wellness', 'like_new', true, 75, 'United Arab Emirates', 'Dubai', 25.2048, 55.2708, true, 'Only need one. Others unopened.', 0),
  (sample_user_id, 'Hemp Aromatherapy Diffuser Blend', 'Essential oil blend. 2oz bottle.', 'wellness', 'good', true, 90, 'Philippines', 'Manila', 14.5995, 120.9842, true, 'Calming scent with hemp base.', 1);

  -- CONSTRUCTION/OTHER (5 items)
  INSERT INTO swap_items (user_id, title, description, category, condition, hemp_inside, hemp_percentage, country, city, latitude, longitude, willing_to_ship, story, years_in_use) VALUES
  (sample_user_id, 'Hemp Rope - 50 feet', 'Marine-grade hemp rope, 1/2 inch diameter.', 'construction', 'like_new', true, 100, 'Croatia', 'Split', 43.5081, 16.4402, true, 'Boat project never happened. Never used.', 0),
  (sample_user_id, 'Hemp Insulation Sample', 'Hempcrete insulation blocks. 5 blocks.', 'construction', 'like_new', true, 95, 'Czech Republic', 'Prague', 50.0755, 14.4378, false, 'Left over from building project.', 0),
  (sample_user_id, 'Hemp Twine Spool - Large', 'Heavy-duty garden twine. 500 feet, 60% remaining.', 'construction', 'good', true, 100, 'Hungary', 'Budapest', 47.4979, 19.0402, true, 'Used for tomato trellises.', 2),
  (sample_user_id, 'Hemp Canvas Drop Cloth', 'Painters drop cloth, 9x12 feet. Washable.', 'construction', 'well_loved', true, 100, 'Romania', 'Bucharest', 44.4268, 26.1025, true, 'Protected floors during 3 painting projects.', 3),
  (sample_user_id, 'Hemp Geotextile Fabric', 'Biodegradable landscape fabric. 6x10 feet sheet.', 'other', 'like_new', true, 100, 'Peru', 'Lima', -12.0464, -77.0428, true, 'Eco-friendly alternative to plastic.', 0);

  RAISE NOTICE '✅ Setup complete!';
  RAISE NOTICE '📦 Inserted 50 items across 50 cities';
  RAISE NOTICE '🌍 Categories: clothing (15), accessories (12), home_goods (10), wellness (8), construction/other (5)';
  RAISE NOTICE '🎯 Navigate to SWAP Shop to see your items!';
END $$;
