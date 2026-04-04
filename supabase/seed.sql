-- ============================================
-- SOYPROFESIONAL - Seed Data (CORREGIDO v2)
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================

-- Step 1: Create fake users in auth.users first
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carlos@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"name": "Carlos Mendoza"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"name": "Ana Rodríguez"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'diego@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"name": "Diego López"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'miguel@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"name": "Miguel Ángel"}'::jsonb),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'roberto@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"name": "Roberto Díaz"}'::jsonb),
  ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maria@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"name": "María García"}'::jsonb),
  ('00000000-0000-0000-0000-000000000098', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pedro@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"name": "Pedro Suárez"}'::jsonb),
  ('00000000-0000-0000-0000-000000000097', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'laura@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"name": "Laura Martínez"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create identities for the users
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"sub": "00000000-0000-0000-0000-000000000001", "email": "carlos@demo.com"}'::jsonb, 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '{"sub": "00000000-0000-0000-0000-000000000002", "email": "ana@demo.com"}'::jsonb, 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '{"sub": "00000000-0000-0000-0000-000000000003", "email": "diego@demo.com"}'::jsonb, 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '{"sub": "00000000-0000-0000-0000-000000000004", "email": "miguel@demo.com"}'::jsonb, 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '{"sub": "00000000-0000-0000-0000-000000000005", "email": "roberto@demo.com"}'::jsonb, 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000099', '{"sub": "00000000-0000-0000-0000-000000000099", "email": "maria@demo.com"}'::jsonb, 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000098', '00000000-0000-0000-0000-000000000098', '{"sub": "00000000-0000-0000-0000-000000000098", "email": "pedro@demo.com"}'::jsonb, 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000097', '00000000-0000-0000-0000-000000000097', '{"sub": "00000000-0000-0000-0000-000000000097", "email": "laura@demo.com"}'::jsonb, 'email', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Step 3: Update profiles with correct data
UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
  role = 'professional'
WHERE id = '00000000-0000-0000-0000-000000000001';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  role = 'professional'
WHERE id = '00000000-0000-0000-0000-000000000002';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
  role = 'professional'
WHERE id = '00000000-0000-0000-0000-000000000003';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  role = 'professional'
WHERE id = '00000000-0000-0000-0000-000000000004';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  role = 'professional'
WHERE id = '00000000-0000-0000-0000-000000000005';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop'
WHERE id = '00000000-0000-0000-0000-000000000099';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'
WHERE id = '00000000-0000-0000-0000-000000000098';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop'
WHERE id = '00000000-0000-0000-0000-000000000097';

-- Step 4: Create Professionals (using valid UUIDs)
INSERT INTO public.professionals (id, profile_id, trade, description, skills, rating, review_count, lat, lng, status, is_verified, is_early_adopter, is_boosted) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Gasista',
   'Instalación, mantenimiento y reparación de equipos de gas. Más de 10 años de experiencia en Bahía Blanca. Matriculado 1ra categoría.',
   ARRAY['Instalación', 'Mantenimiento', 'Caloramas', 'Termotanques'], 4.8, 127,
   -38.7183, -62.2663, 'Instalando estufas en Bahía Blanca', true, true, true),

  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Electricista',
   'Instalaciones eléctricas domiciliarias e industriales. Tableros, puesta a tierra, iluminación LED y recableado completo.',
   ARRAY['Domiciliario', 'Industrial', 'Tableros', 'LED'], 4.9, 89,
   -38.7223, -62.2563, 'Disponible para urgencias', true, true, false),

  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Plomero',
   'Reparaciones de cañerías, destapaciones, instalación de termotanques y calefones. Servicio urgente 24hs.',
   ARRAY['Plomería', 'Gas', 'Urgencias', 'Termotanques'], 4.6, 64,
   -38.7133, -62.2763, 'En obra - Bahía Blanca Centro', true, false, false),

  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Albañil',
   'Albañilería general, revoques, contrapisos, carpetas y colocación de cerámicos. Presupuestos sin cargo.',
   ARRAY['Albañilería', 'Revoques', 'Pisos', 'Losa'], 4.5, 42,
   -38.7283, -62.2703, 'Terminando revoque', false, false, false),

  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Carpintero',
   'Muebles a medida, placares, bajo mesadas y restauraciones de madera maciza. Trabajos garantizados.',
   ARRAY['Muebles', 'Restauración', 'Madera', 'Laqueado'], 4.9, 15,
   -38.7083, -62.2603, 'En el taller', true, false, false)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Create Reviews
INSERT INTO public.reviews (professional_id, client_id, client_name, client_avatar, rating, comment, tags, is_verified) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000099', 'María García',
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
   5, 'Excelente profesional, muy puntual y prolijo. Recomiendo 100%.', ARRAY['Puntual', 'Prolijo'], true),

  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000098', 'Pedro Suárez',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
   5, 'Hizo un trabajo impecable. Precio justo y cumplió con los tiempos.', ARRAY['Precio justo', 'Recomendable'], true),

  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000097', 'Laura Martínez',
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
   4, 'Muy buen trabajo, volvería a contratarlo sin dudarlo.', ARRAY['Recomendable'], true),

  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Roberto Díaz',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
   5, 'Cambió las térmicas rapidísimo y dejó todo funcionando perfecto.', ARRAY['Puntual', 'Prolijo', 'Precio justo'], true)
ON CONFLICT DO NOTHING;

-- Step 6: Create Portfolio Items
INSERT INTO public.portfolio_items (professional_id, images, caption, description, category, tags, likes, comments, location) VALUES
  ('10000000-0000-0000-0000-000000000001',
   ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=600&fit=crop'],
   'Remodelación completa de baño',
   'Cambio total de cañerías de gas y agua en un baño de 15 años.',
   'antes-despues', ARRAY['Plomería', 'Remodelación', 'Termotanque'], 87, 12, 'Bahía Blanca Centro'),

  ('10000000-0000-0000-0000-000000000001',
   ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop'],
   'Instalación de calefón de última generación',
   'Calefón tiro balanceado marca Orbis instalado con todas las normas de seguridad.',
   'terminado', ARRAY['Instalación', 'Calefón', 'Gas'], 54, 8, 'Villa Mitre'),

  ('10000000-0000-0000-0000-000000000001',
   ARRAY['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=600&fit=crop'],
   'Reparación de estufa a gas',
   'Servicio de mantenimiento y reparación de estufa que no encendía correctamente.',
   'terminado', ARRAY['Reparación', 'Estufa', 'Mantenimiento'], 31, 4, 'Barrio Universitario'),

  ('10000000-0000-0000-0000-000000000002',
   ARRAY['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1621905252072-958e528fa924?w=600&h=600&fit=crop'],
   'Tablero eléctrico completamente renovado',
   'Reemplazo total del tablero eléctrico antiguo con térmicas y disyuntor diferencial.',
   'antes-despues', ARRAY['Tablero', 'Seguridad', 'Normas'], 72, 11, 'Villa Mitre'),

  ('10000000-0000-0000-0000-000000000002',
   ARRAY['https://images.unsplash.com/photo-1558618047-f4b511b566ef?w=600&h=600&fit=crop'],
   'Iluminación LED en local comercial',
   'Instalación de sistema de iluminación LED completo en local de 120m².',
   'terminado', ARRAY['LED', 'Comercial', 'Iluminación'], 48, 7, 'Centro'),

  ('10000000-0000-0000-0000-000000000003',
   ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=600&fit=crop'],
   'Renovación total de baño',
   'Cambio completo de cañerías, grifería, inodoro y ducha.',
   'antes-despues', ARRAY['Baño', 'Renovación', 'Grifería'], 93, 15, 'Centro'),

  ('10000000-0000-0000-0000-000000000005',
   ARRAY['https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop'],
   'Mueble de living a medida',
   'Mueble de TV y biblioteca en melamina roble nebraska con puertas push-open.',
   'antes-despues', ARRAY['Mueble', 'Living', 'A medida'], 128, 22, 'Bahía Blanca'),

  ('10000000-0000-0000-0000-000000000005',
   ARRAY['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=600&fit=crop'],
   'Restauración de mesa de algarrobo',
   'Lijado, teñido y laqueado de mesa de algarrobo macizo de los años 80.',
   'terminado', ARRAY['Restauración', 'Madera', 'Laqueado'], 95, 14, 'Villa Mitre')
ON CONFLICT DO NOTHING;
