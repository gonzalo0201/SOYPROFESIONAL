-- ==========================================
-- SUPABASE STORAGE - Buckets para imágenes
-- Ejecutar en Supabase SQL Editor
-- ==========================================

-- 1. Crear buckets de storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('portfolio', 'portfolio', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('stories', 'stories', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Storage para AVATARS
-- Cualquiera puede ver avatars (son públicos)
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Usuarios autenticados pueden subir su propio avatar
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Usuarios pueden actualizar/reemplazar su avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Usuarios pueden borrar su avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 3. Políticas de Storage para PORTFOLIO
-- Cualquiera puede ver fotos de portfolio (son públicas)
DROP POLICY IF EXISTS "Public portfolio access" ON storage.objects;
CREATE POLICY "Public portfolio access" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolio');

-- Usuarios autenticados pueden subir fotos a su carpeta de portfolio
DROP POLICY IF EXISTS "Users can upload portfolio" ON storage.objects;
CREATE POLICY "Users can upload portfolio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'portfolio' AND
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Usuarios pueden borrar sus propias fotos de portfolio
DROP POLICY IF EXISTS "Users can delete own portfolio" ON storage.objects;
CREATE POLICY "Users can delete own portfolio" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'portfolio' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 4. Políticas de Storage para STORIES
DROP POLICY IF EXISTS "Public stories access" ON storage.objects;
CREATE POLICY "Public stories access" ON storage.objects
    FOR SELECT USING (bucket_id = 'stories');

DROP POLICY IF EXISTS "Users can upload stories" ON storage.objects;
CREATE POLICY "Users can upload stories" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'stories' AND
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can delete own stories" ON storage.objects;
CREATE POLICY "Users can delete own stories" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'stories' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ✅ Listo! 3 buckets creados: avatars, portfolio, stories
