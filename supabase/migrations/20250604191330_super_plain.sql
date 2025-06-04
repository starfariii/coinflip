/*
  # Initial schema for Coinflip game

  1. New Tables
    - `items`
      - Stores available items that can be used in matches
      - Fields: id, name, value, rarity, image_url, user_id
    - `matches`
      - Stores active and completed matches
      - Fields: id, creator_id, selected_side, status, created_at
    - `match_items`
      - Junction table for items in matches
      - Fields: id, match_id, item_id, user_id, side

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value integer NOT NULL,
  rarity text NOT NULL,
  image_url text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read items"
  ON items
  FOR SELECT
  TO authenticated
  USING (true);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id),
  selected_side text NOT NULL CHECK (selected_side IN ('heads', 'tails')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  result text CHECK (result IN ('heads', 'tails')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can read matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (true);

-- Create match_items table
CREATE TABLE IF NOT EXISTS match_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  item_id uuid REFERENCES items(id),
  user_id uuid REFERENCES auth.users(id),
  side text NOT NULL CHECK (side IN ('heads', 'tails')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE match_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can add their items to matches"
  ON match_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read match items"
  ON match_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to create sample data for a user
CREATE OR REPLACE FUNCTION create_sample_data(user_uuid uuid)
RETURNS void AS $$
DECLARE
  item1_id uuid;
  item2_id uuid;
  item3_id uuid;
  match1_id uuid;
BEGIN
  -- Create sample items for the user
  INSERT INTO items (name, value, rarity, image_url, user_id) VALUES
    ('Golden Coin', 100, 'rare', 'https://images.pexels.com/photos/106152/euro-coins-currency-money-106152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', user_uuid) RETURNING id INTO item1_id;
  
  INSERT INTO items (name, value, rarity, image_url, user_id) VALUES
    ('Mystery Box', 200, 'epic', 'https://images.pexels.com/photos/821718/pexels-photo-821718.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', user_uuid) RETURNING id INTO item2_id;
  
  INSERT INTO items (name, value, rarity, image_url, user_id) VALUES
    ('Lucky Charm', 50, 'uncommon', 'https://images.pexels.com/photos/4588036/pexels-photo-4588036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', user_uuid) RETURNING id INTO item3_id;

  -- Create a sample active match
  INSERT INTO matches (creator_id, selected_side, status)
  VALUES (user_uuid, 'heads', 'active')
  RETURNING id INTO match1_id;

  -- Add items to the match
  INSERT INTO match_items (match_id, item_id, user_id, side)
  VALUES (match1_id, item1_id, user_uuid, 'heads');
END;
$$ LANGUAGE plpgsql;

-- Trigger to create sample data for new users
CREATE OR REPLACE FUNCTION create_user_sample_data()
RETURNS trigger AS $$
BEGIN
  PERFORM create_sample_data(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_sample_data();