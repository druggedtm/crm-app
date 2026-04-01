create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  address text,
  lat double precision,
  lng double precision,
  website text,
  email text,
  phone text,
  ai_analysis text,
  created_at timestamptz default now()
);

alter table leads enable row level security;

create policy "Allow public read access on leads"
  on leads for select
  using (true);

create policy "Allow authenticated insert on leads"
  on leads for insert
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated update on leads"
  on leads for update
  using (auth.role() = 'authenticated');

create policy "Allow authenticated delete on leads"
  on leads for delete
  using (auth.role() = 'authenticated');

INSERT INTO leads (name, category, address, lat, lng, website, email, phone, ai_analysis)
VALUES
  (
    'Acme Coffee Roasters',
    'Restaurant',
    '350 5th Ave, New York, NY 10118',
    40.748817,
    -73.985428,
    'https://acmecoffee.example.com',
    'hello@acmecoffee.example.com',
    '+1-212-555-0101',
    'High-potential lead. Located in a high-traffic commercial area near Penn Station. Strong online presence with 4.5 star average reviews. Recommend reaching out with a partnership proposal for catering services.'
  ),
  (
    'Green Valley Fitness',
    'Health & Wellness',
    '1200 Lake Shore Dr, Chicago, IL 60610',
    41.902165,
    -87.626209,
    'https://greenvalleyfitness.example.com',
    'info@greenvalleyfitness.example.com',
    '+1-312-555-0202',
    'Growing fitness chain expanding to the Midwest. Currently operates 3 locations. Target demographic is 25-45 year old professionals. Good fit for our premium service tier. Decision maker is CEO Maria Chen.'
  ),
    (
    'Sunrise Dental Clinic',
    'Healthcare',
    '2100 Broadway, San Francisco, CA 94115',
    37.787950,
    -122.425600,
    'https://sunrisedental.example.com',
    'appointments@sunrisedental.example.com',
    '+1-415-555-0303',
    'Established dental practice with 12 years of operation. Recently expanded to include orthodontics. Looking for new patient management software. Budget estimated at $15k-25k. Contact Dr. Sarah Kim directly.'
  );
