-- Insert common crops
INSERT INTO public.crops (name, description, scientific_name, season, unit) VALUES
  ('Rice', 'Staple grain crop', 'Oryza sativa', 'Kharif', 'kg'),
  ('Wheat', 'Rabi season grain crop', 'Triticum aestivum', 'Rabi', 'kg'),
  ('Cotton', 'Cash crop for textile industry', 'Gossypium', 'Kharif', 'kg'),
  ('Sugarcane', 'Sugar production crop', 'Saccharum officinarum', 'Year-round', 'kg'),
  ('Corn', 'Maize crop', 'Zea mays', 'Kharif', 'kg'),
  ('Soybean', 'Legume crop', 'Glycine max', 'Kharif', 'kg'),
  ('Groundnut', 'Oil seed crop', 'Arachis hypogaea', 'Kharif', 'kg'),
  ('Onion', 'Vegetable crop', 'Allium cepa', 'Rabi', 'kg'),
  ('Potato', 'Tuber crop', 'Solanum tuberosum', 'Rabi', 'kg'),
  ('Tomato', 'Vegetable crop', 'Solanum lycopersicum', 'Year-round', 'kg')
ON CONFLICT DO NOTHING;

-- Insert sample MSP prices
INSERT INTO public.msp_prices (crop_id, season, msp_price, effective_date, valid_until, state) 
SELECT 
  c.id,
  'Kharif',
  CASE 
    WHEN c.name = 'Rice' THEN 2100.00
    WHEN c.name = 'Cotton' THEN 5500.00
    WHEN c.name = 'Corn' THEN 1950.00
    WHEN c.name = 'Soybean' THEN 3950.00
    WHEN c.name = 'Groundnut' THEN 5275.00
    ELSE 2000.00
  END,
  '2024-12-05'::DATE,
  '2025-12-31'::DATE,
  'All India'
FROM public.crops c
WHERE c.season = 'Kharif'
ON CONFLICT DO NOTHING;

INSERT INTO public.msp_prices (crop_id, season, msp_price, effective_date, valid_until, state) 
SELECT 
  c.id,
  'Rabi',
  CASE 
    WHEN c.name = 'Wheat' THEN 2425.00
    WHEN c.name = 'Onion' THEN 1500.00
    WHEN c.name = 'Potato' THEN 800.00
    ELSE 2000.00
  END,
  '2024-12-05'::DATE,
  '2025-12-31'::DATE,
  'All India'
FROM public.crops c
WHERE c.season = 'Rabi'
ON CONFLICT DO NOTHING;
