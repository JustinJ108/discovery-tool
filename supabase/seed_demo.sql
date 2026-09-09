-- ============================================================
-- Seed data for the public demo account (demo@discoverytool.com)
--
-- Run this ONCE in Supabase → SQL Editor, after that account has
-- signed up at least once (so it exists in auth.users). Safe to
-- re-run: it looks up the demo user by email each time, but running
-- it twice will duplicate the sample rows, so drop them first if
-- you want a clean re-seed:
--   delete from pain_points where owner_id = (select id from auth.users where email = 'demo@discoverytool.com');
--   delete from discovery_notes where owner_id = (select id from auth.users where email = 'demo@discoverytool.com');
--   delete from contacts where owner_id = (select id from auth.users where email = 'demo@discoverytool.com');
--   delete from organizations where owner_id = (select id from auth.users where email = 'demo@discoverytool.com');
-- ============================================================

do $$
declare
  demo_user_id uuid;
  org1_id uuid;
  org2_id uuid;
  contact1_id uuid;
  contact2_id uuid;
  note1_id uuid;
  note2_id uuid;
begin
  select id into demo_user_id from auth.users where email = 'demo@discoverytool.com';

  if demo_user_id is null then
    raise exception 'No user found with email demo@discoverytool.com — sign up that account first, then re-run this script.';
  end if;

  insert into organizations (name, industry, website, size, notes, owner_id)
  values (
    'Acme Robotics',
    'Manufacturing',
    'https://acmerobotics.example.com',
    '51-200',
    'Referral from a LinkedIn connection, evaluating automation vendors for Q4.',
    demo_user_id
  )
  returning id into org1_id;

  insert into organizations (name, industry, website, size, notes, owner_id)
  values (
    'Northwind Logistics',
    'Logistics',
    'https://northwindlogistics.example.com',
    '201-500',
    'Inbound lead from a webinar signup.',
    demo_user_id
  )
  returning id into org2_id;

  insert into contacts (organization_id, first_name, last_name, title, email, phone, linkedin_url, owner_id)
  values (
    org1_id, 'Priya', 'Nair', 'VP of Operations',
    'priya.nair@acmerobotics.example.com', '555-0142',
    'https://linkedin.com/in/priyanair-example', demo_user_id
  )
  returning id into contact1_id;

  insert into contacts (organization_id, first_name, last_name, title, email, phone, linkedin_url, owner_id)
  values (
    org2_id, 'Marcus', 'Chen', 'Director of Supply Chain',
    'marcus.chen@northwindlogistics.example.com', '555-0198',
    'https://linkedin.com/in/marcuschen-example', demo_user_id
  )
  returning id into contact2_id;

  insert into discovery_notes (organization_id, contact_id, title, content, meeting_date, owner_id)
  values (
    org1_id, contact1_id, 'Kickoff call',
    'Priya flagged that their current inventory system doesn''t talk to their scheduling software. Manual reconciliation takes ~6 hours/week across two people. Budget cycle starts in Q1; she''s the economic buyer but needs sign-off from the plant manager.',
    current_date - interval '5 days', demo_user_id
  )
  returning id into note1_id;

  insert into discovery_notes (organization_id, contact_id, title, content, meeting_date, owner_id)
  values (
    org2_id, contact2_id, 'Discovery call',
    'Marcus mentioned their warehouse teams are still tracking shipments in spreadsheets. They''ve had two mis-shipments this quarter due to version control issues. Open to a pilot in one region first.',
    current_date - interval '2 days', demo_user_id
  )
  returning id into note2_id;

  insert into pain_points (organization_id, contact_id, discovery_note_id, description, category, severity, owner_id)
  values
    (org1_id, contact1_id, note1_id,
     'Inventory and scheduling systems are disconnected, causing weekly manual reconciliation.',
     'technical', 'high', demo_user_id),
    (org1_id, contact1_id, null,
     'Plant manager sign-off adds an extra approval layer that slows the buying process.',
     'process', 'medium', demo_user_id),
    (org2_id, contact2_id, note2_id,
     'Shipment tracking relies on spreadsheets with no version control, causing mis-shipments.',
     'technical', 'critical', demo_user_id),
    (org2_id, contact2_id, null,
     'Team is hesitant to roll out company-wide without a regional pilot first.',
     'process', 'low', demo_user_id);
end $$;
