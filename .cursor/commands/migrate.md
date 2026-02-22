# Migrate

Run and verify a Supabase migration.

1. Find or create migration in `supabase/migrations/`.
2. Review SQL: RLS policies, indexes, FK constraints.
3. Apply: `supabase db reset` or `supabase migration up` locally.
4. Regenerate types: `supabase gen types typescript --local > frontend/types/supabase.ts`
5. Run backend tests touching affected tables.
6. Report: migration file, tables affected, type changes.
