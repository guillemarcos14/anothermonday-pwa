import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://yhxcdjcdxjftdnwavgpg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeGNkamNkeGpmdGRud2F2Z3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjEzNzIsImV4cCI6MjA4OTkzNzM3Mn0.P2kXxriGTPr0KU2hCBR0aV70qL0puzhcrLZTWOObGW0'
)
