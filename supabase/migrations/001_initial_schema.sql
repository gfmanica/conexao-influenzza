-- ── Enum ──────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'architect');

-- ── Tables ────────────────────────────────────────────────────────────────

CREATE TABLE user_profiles (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id  uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role          user_role NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE architects (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid REFERENCES user_profiles(id),
    name            text NOT NULL,
    email           text NOT NULL UNIQUE,
    office_email    text,
    phone           text,
    office_address  text,
    birthdate       date,
    cau_register    text,
    observation     text,
    photo_url       text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE point_entries (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    architect_id    uuid NOT NULL REFERENCES architects(id) ON DELETE CASCADE,
    point_type      text NOT NULL,
    amount          integer NOT NULL CHECK (amount > 0),
    entry_date      date NOT NULL DEFAULT CURRENT_DATE,
    created_by      uuid REFERENCES auth.users(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX idx_point_entries_architect ON point_entries(architect_id);
CREATE INDEX idx_point_entries_date ON point_entries(entry_date DESC);
CREATE INDEX idx_point_entries_type ON point_entries(point_type);
CREATE INDEX idx_architects_email ON architects(email);

-- ── Helper functions (Security Definer) ───────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE auth_user_id = auth.uid() AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION my_architect_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT a.id FROM architects a
    JOIN user_profiles up ON up.id = a.user_id
    WHERE up.auth_user_id = auth.uid();
$$;

-- ── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE architects ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_entries ENABLE ROW LEVEL SECURITY;

-- user_profiles
CREATE POLICY "users_select_own_or_admin" ON user_profiles
    FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());

CREATE POLICY "admins_insert" ON user_profiles
    FOR INSERT WITH CHECK (is_admin());

-- architects
CREATE POLICY "architects_select" ON architects
    FOR SELECT USING (is_admin() OR id = my_architect_id());

CREATE POLICY "architects_insert" ON architects
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "architects_update" ON architects
    FOR UPDATE USING (is_admin());

CREATE POLICY "architects_delete" ON architects
    FOR DELETE USING (is_admin());

-- point_entries
CREATE POLICY "point_entries_select" ON point_entries
    FOR SELECT USING (is_admin() OR architect_id = my_architect_id());

CREATE POLICY "point_entries_insert" ON point_entries
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "point_entries_update" ON point_entries
    FOR UPDATE USING (is_admin());

CREATE POLICY "point_entries_delete" ON point_entries
    FOR DELETE USING (is_admin());

-- ── Triggers updated_at ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_architects_updated_at
    BEFORE UPDATE ON architects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_point_entries_updated_at
    BEFORE UPDATE ON point_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Storage Bucket ────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

CREATE POLICY "admins_upload_avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND is_admin());

CREATE POLICY "public_read_avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
