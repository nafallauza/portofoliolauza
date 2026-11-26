-- Portfolio items (projects + certificates). Run in Supabase SQL Editor.
drop table if exists public.projects;

create table public.projects (
  id bigint generated always as identity primary key,
  category text not null check (category in ('website', 'uiux', 'video', 'certificate')),
  category_label text,
  title text not null,
  description text,
  full_desc text,
  links jsonb not null default '[]',
  images text[] not null default '{}',
  youtube_url text,
  issuer text,
  date_label text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "public read published" on public.projects for select to anon using (published);
create policy "admin all" on public.projects for all to authenticated using (true) with check (true);

-- project was created with "auto-grant new tables" off
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;

-- Images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 5242880, array['image/*'])
on conflict (id) do nothing;

create policy "admin upload" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio');
create policy "admin update" on storage.objects for update to authenticated using (bucket_id = 'portfolio');
create policy "admin delete" on storage.objects for delete to authenticated using (bucket_id = 'portfolio');
-- remove() also needs select on the objects
create policy "admin read" on storage.objects for select to authenticated using (bucket_id = 'portfolio');

-- Contact messages (public insert with basic validation; admin reads & manages in /admin)
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  name text not null check (length(trim(name)) between 1 and 120),
  email text not null check (length(trim(email)) between 3 and 180),
  subject text not null default '',
  message text not null check (length(trim(message)) between 1 and 4000),
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "public send message" on public.messages for insert to anon with check (true);
create policy "admin manage messages" on public.messages for all to authenticated using (true) with check (true);

grant insert on public.messages to anon;
grant select, update, delete on public.messages to authenticated;
