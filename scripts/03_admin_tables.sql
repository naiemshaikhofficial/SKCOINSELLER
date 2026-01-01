-- Create admins table for role-based access
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Admins can view admin list" ON admins;
DROP POLICY IF EXISTS "Users can check their own admin status" ON admins;
DROP POLICY IF EXISTS "Admins can create new admins" ON admins;
DROP POLICY IF EXISTS "Admins can insert coins" ON coins;
DROP POLICY IF EXISTS "Admins can update coins" ON coins;
DROP POLICY IF EXISTS "Admins can delete coins" ON coins;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all shipments" ON shipment_tracking;
DROP POLICY IF EXISTS "Admins can insert shipment tracking" ON shipment_tracking;
DROP POLICY IF EXISTS "Admins can update shipment tracking" ON shipment_tracking;
DROP POLICY IF EXISTS "Admins can view all tracking history" ON tracking_history;
DROP POLICY IF EXISTS "Admins can insert tracking history" ON tracking_history;

-- CRITICAL FIX: Allow users to check if THEY are admin
CREATE POLICY "Users can check their own admin status" ON admins
  FOR SELECT USING (
    auth.uid() = id
  );

-- Policy: Only admins can insert new admins
CREATE POLICY "Admins can create new admins" ON admins
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Add admin policies for coins table (admins can modify)
CREATE POLICY "Admins can insert coins" ON coins
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admins)
  );

CREATE POLICY "Admins can update coins" ON coins
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admins)
  );

CREATE POLICY "Admins can delete coins" ON coins
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Add admin policies for orders (admins can view and modify all orders)
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admins)
  );

CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Add admin policies for shipment_tracking
CREATE POLICY "Admins can view all shipments" ON shipment_tracking
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admins)
  );

CREATE POLICY "Admins can insert shipment tracking" ON shipment_tracking
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admins)
  );

CREATE POLICY "Admins can update shipment tracking" ON shipment_tracking
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Add admin policies for tracking_history
CREATE POLICY "Admins can view all tracking history" ON tracking_history
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admins)
  );

CREATE POLICY "Admins can insert tracking history" ON tracking_history
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Create view for daily revenue
CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(total_amount) as revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE payment_status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create view for monthly revenue
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as order_count,
  SUM(total_amount) as revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE payment_status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Create indexes for better performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- IMPORTANT: After running this script, manually insert your user ID as an admin:
-- First, get your user ID:
-- SELECT id, email FROM auth.users;

-- Then insert yourself as admin (replace with your actual user ID):
-- INSERT INTO admins (id) VALUES ('your-user-id-here')
-- ON CONFLICT (id) DO NOTHING;
