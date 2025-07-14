// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ⬇️ Replace these with your actual Supabase values
const SUPABASE_URL = 'https://zsoriphshkqtxipmmufy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzb3JpcGhzaGtxdHhpcG1tdWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NDk2NzMsImV4cCI6MjA2ODAyNTY3M30.v4YEegMXZOmIrvrxNy9VZfn8XmOb6JCwqqwKewcYois';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
