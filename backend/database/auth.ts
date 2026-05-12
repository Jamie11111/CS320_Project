import * as fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SIGNUP FUNCTION
 */
export async function signUpUser(supabase: SupabaseClient, email: string, password: string, fullName: string, redirectTo?: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: fullName 
      },
    }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, user: data.user, session: data.session };
}

/**
 * LOGIN FUNCTION
 */
export async function loginUser(supabase: SupabaseClient, email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, user: data.user, session: data.session };
}

