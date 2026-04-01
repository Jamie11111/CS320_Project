const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Setup Client
const data = fs.readFileSync('keys.txt', 'utf8').split('\n');
const supabase = createClient(data[0].trim(), data[1].trim());

/**
 * SIGNUP FUNCTION
 * Includes metadata for the Trigger and handles errors for the UI
 */
async function signUpUser(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName // This is what the DB Trigger looks for
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
 * Returns the session (token) or a specific error message
 */
async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, session: data.session };
}

async function testSignUp(){
  // Test 1: Sign up a new student
  const signupResult = await signUpUser('asathishkuma@umass.edu', 'superSecurePassword', 'Aditya Sathishkumar');
  console.log('Signup Result:', signupResult);
}

async function testLogin(){
  // Test 2: Log them in (Note: Only works immediately if Email Confirm is OFF)
  const loginResult = await loginUser('asathishkuma@umass.edu', 'superSecurePassword');
  console.log('Login Result:', loginResult);
}

testSignUp();