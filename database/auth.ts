import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SIGNUP FUNCTION
 */
async function signUpUser(supabase: SupabaseClient, email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName 
      }
    }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, user: data.user };
}

/**
 * LOGIN FUNCTION
 */
async function loginUser(supabase: SupabaseClient, email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, session: data.session };
}

const supabase = createClient("https://bhpmgvzlsimfimqxupxf.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocG1ndnpsc2ltZmltcXh1cHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjkzNTcsImV4cCI6MjA5MDc0NTM1N30.FsRLVw5zWCmM43IyjQ8BVidLumgYUCHUxmB0GJpAmA4");

async function testUMassAuth() {

  // Step 1: Attempt Signup
  console.log('--- Testing Signup ---');
  const signup = await signUpUser(supabase, "asathishkuma@umass.edu", "SecurePassword123", "Aditya Sathishkumar");
  
  if (!signup.success) {
    console.log(`⚠️ Signup Note: ${signup.message} (This is normal if user already exists)`);
  } else {
    console.log('✅ Signup Successful');
  }
}

// Execute the test
testUMassAuth();