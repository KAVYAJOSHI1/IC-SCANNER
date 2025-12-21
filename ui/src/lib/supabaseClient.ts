import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Get these from your Supabase Project Settings -> API
// These are DIFFERENT from your backend keys.
const supabaseUrl = 'https://osklhcposuhotnezihaw.supabase.co'
// For the frontend, ALWAYS use the 'anon (public)' key.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9za2xoY3Bvc3Vob3RuZXppaGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjAyODYsImV4cCI6MjA3NjA5NjI4Nn0.gA1Em6frO9o-91vVEVqONYnOWeYUsxs3ASt4qUONLMc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)