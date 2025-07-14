import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gsexwvccgqdbsefxttbd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZXh3dmNjZ3FkYnNlZnh0dGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzE0MjMsImV4cCI6MjA2ODEwNzQyM30.-64lEPJe1FOjg5N-hDhOnLWLBv4Y_RnInqkvsaFD1Iw'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})