import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// null when env is missing, so only the sections that need data fail, not the whole page
export const supabase = url && key ? createClient(url, key) : null;
