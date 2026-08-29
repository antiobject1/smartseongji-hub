CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.event_category AS ENUM ('exam','event','holiday','school','etc');
CREATE TYPE public.suggestion_status AS ENUM ('pending','in_progress','done');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- first registered user becomes admin
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_bootstrap_admin
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

CREATE TABLE public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  is_important boolean NOT NULL DEFAULT false,
  target_grade smallint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notices public read" ON public.notices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "notices admin write" ON public.notices FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.academic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  event_date date NOT NULL,
  category public.event_category NOT NULL DEFAULT 'school',
  target_grade smallint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academic_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_events TO authenticated;
GRANT ALL ON public.academic_events TO service_role;
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read" ON public.academic_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "events admin write" ON public.academic_events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade smallint NOT NULL CHECK (grade BETWEEN 1 AND 3),
  class_no smallint NOT NULL CHECK (class_no BETWEEN 1 AND 9),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 1 AND 5),
  period smallint NOT NULL CHECK (period BETWEEN 1 AND 8),
  subject text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (grade, class_no, weekday, period)
);
GRANT SELECT ON public.timetable_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_entries TO authenticated;
GRANT ALL ON public.timetable_entries TO service_role;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timetable public read" ON public.timetable_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "timetable admin write" ON public.timetable_entries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade smallint NOT NULL CHECK (grade BETWEEN 1 AND 3),
  class_no smallint NOT NULL CHECK (class_no BETWEEN 1 AND 9),
  subject text NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.assignments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments public read" ON public.assignments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "assignments admin write" ON public.assignments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_name text NOT NULL DEFAULT '익명',
  status public.suggestion_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.suggestions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suggestions TO authenticated;
GRANT ALL ON public.suggestions TO service_role;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suggestions anyone can submit" ON public.suggestions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "suggestions admin read" ON public.suggestions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "suggestions admin update" ON public.suggestions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "suggestions admin delete" ON public.suggestions FOR DELETE TO authenticated USING (public.is_admin());