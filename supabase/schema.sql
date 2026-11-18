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
