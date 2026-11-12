-- Execute no SQL Editor do projeto Supabase conectado ao Zyon Chat.
-- Esta migração protege somente public.perfis. Outras tabelas precisam de RLS próprio.
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

revoke all on public.perfis from anon;
grant select, insert, update, delete on public.perfis to authenticated;

drop policy if exists "perfis_select_proprio" on public.perfis;
create policy "perfis_select_proprio" on public.perfis
for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "perfis_insert_proprio" on public.perfis;
create policy "perfis_insert_proprio" on public.perfis
for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "perfis_update_proprio" on public.perfis;
create policy "perfis_update_proprio" on public.perfis
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "perfis_delete_proprio" on public.perfis;
create policy "perfis_delete_proprio" on public.perfis
for delete to authenticated using ((select auth.uid()) = id);

create or replace function public.criar_perfil_usuario()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome_completo)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
after insert on auth.users for each row execute function public.criar_perfil_usuario();

-- Cria perfis faltantes para contas antigas (sem sobrescrever perfis existentes).
insert into public.perfis (id, nome_completo)
select id, coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;
