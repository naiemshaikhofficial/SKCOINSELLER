-- Create courier services table
CREATE TABLE courier_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  base_rate DECIMAL(10, 2) NOT NULL,
  per_kg_rate DECIMAL(10, 2),
  estimated_delivery_days INTEGER,
  regions TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shipment tracking table
CREATE TABLE shipment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_service_id UUID REFERENCES courier_services(id),
  tracking_number VARCHAR(100) UNIQUE NOT NULL,
  current_status VARCHAR(50) DEFAULT 'pending',
  current_location VARCHAR(255),
  estimated_delivery_date DATE,
  shipped_date TIMESTAMP,
  delivered_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tracking history table for detailed tracking
CREATE TABLE tracking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipment_tracking(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE courier_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courier_services (anyone can read)
CREATE POLICY "Courier services are viewable by everyone" ON courier_services
  FOR SELECT USING (true);

-- RLS Policies for shipment_tracking (users can only see their own)
CREATE POLICY "Users can view their own shipments" ON shipment_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = shipment_tracking.order_id AND orders.user_id = auth.uid()
    )
  );

-- RLS Policies for tracking_history
CREATE POLICY "Users can view their tracking history" ON tracking_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipment_tracking 
      JOIN orders ON orders.id = shipment_tracking.order_id
      WHERE shipment_tracking.id = tracking_history.shipment_id AND orders.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_shipment_tracking_order_id ON shipment_tracking(order_id);
CREATE INDEX idx_shipment_tracking_tracking_number ON shipment_tracking(tracking_number);
CREATE INDEX idx_tracking_history_shipment_id ON tracking_history(shipment_id);

-- Insert sample courier services
INSERT INTO courier_services (name, code, base_rate, per_kg_rate, estimated_delivery_days, regions) VALUES
  ('DHL Express', 'dhl', 500.00, 50.00, 2, ARRAY['North', 'South', 'East', 'West']),
  ('FedEx', 'fedex', 450.00, 45.00, 2, ARRAY['North', 'South', 'East', 'West']),
  ('Blue Dart', 'bluedart', 350.00, 30.00, 3, ARRAY['North', 'South', 'East', 'West']),
  ('Shiprocket', 'shiprocket', 300.00, 25.00, 4, ARRAY['North', 'South', 'East', 'West']),
  ('DTDC', 'dtdc', 280.00, 20.00, 4, ARRAY['North', 'South', 'East', 'West']),
  ('Ecom Express', 'ecomexpress', 250.00, 15.00, 5, ARRAY['North', 'South', 'East', 'West']);
