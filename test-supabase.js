import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jptqwesfjiokzmginteo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdHF3ZXNmamloa3ptZ2ludGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Njk2MzYsImV4cCI6MjA3MjA0NTYzNn0.dTjSOFb3jwAP5V0jl8RA_QfUNEd7oMNZKDDpbIIafdA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' });
    
    if (error) {
      console.log('Connection test result:', error.message);
    } else {
      console.log('Connection successful!');
    }
    
    // Try to create a test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@teste.com',
      password: '123456'
    });
    
    if (signUpError) {
      console.log('SignUp error:', signUpError.message);
    } else {
      console.log('Test user created successfully:', signUpData);
    }
    
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
