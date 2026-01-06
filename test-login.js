const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://iqzkdxxuihmpfqhezxxm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxemtkeHh1aWhtcGZxaGV6eHhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3MzA4MywiZXhwIjoyMDgzMjQ5MDgzfQ.lx7Ehh_zeC4GS8FxgFcT-Tiqgx0O4QHyEU-0vK2YdHM';

async function testLogin() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // 1. 사용자 조회
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('employee_id', 'EMP001')
    .single();
  
  console.log('=== Test Login ===');
  console.log('User Error:', userError);
  console.log('User Found:', !!user);
  
  if (user) {
    console.log('User ID:', user.id);
    console.log('Employee ID:', user.employee_id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Password Hash:', user.password_hash);
    
    // 2. 비밀번호 검증
    const password = 'password123';
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('\n=== Password Verification ===');
    console.log('Input Password:', password);
    console.log('Is Valid:', isValid);
    
    // 3. 새로운 해시 생성
    const newHash = await bcrypt.hash(password, 10);
    console.log('\n=== New Hash ===');
    console.log('New Hash:', newHash);
    const testVerify = await bcrypt.compare(password, newHash);
    console.log('Test Verify:', testVerify);
  }
}

testLogin().catch(console.error);
