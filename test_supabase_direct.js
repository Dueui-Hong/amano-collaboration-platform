// Supabase 직접 연결 테스트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wsredeftfoelzgkdalhx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcmVkZWZ0Zm9lbHpna2RhbGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjI4NzgsImV4cCI6MjA4Mzk5ODg3OH0.NK-VW8aaV3gr_yIZaF242kvuwhX9th0RNev7DquzVaw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🔍 1단계: 로그인 시도...');
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'minseok_kim1@amano.co.kr',
      password: '1111'
    });

    if (authError) {
      console.error('❌ 로그인 실패:', authError.message);
      return;
    }

    console.log('✅ 로그인 성공!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    console.log('\n🔍 2단계: 프로필 조회 시도...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ 프로필 조회 실패:', profileError.message);
      console.error('   상세:', profileError);
      return;
    }

    console.log('✅ 프로필 조회 성공!');
    console.log('   이름:', profile.name);
    console.log('   역할:', profile.role);
    console.log('   직책:', profile.position);

    console.log('\n🔍 3단계: 업무 목록 조회 시도...');
    
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(5);

    if (tasksError) {
      console.error('❌ 업무 조회 실패:', tasksError.message);
      console.error('   상세:', tasksError);
      return;
    }

    console.log('✅ 업무 조회 성공!');
    console.log('   업무 개수:', tasks.length);

    console.log('\n🎉 모든 테스트 성공!');
    
  } catch (error) {
    console.error('❌ 예상치 못한 에러:', error);
  }
}

testLogin();
