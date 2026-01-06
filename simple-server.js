const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://iqzkdxxuihmpfqhezxxm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxemtkeHh1aWhtcGZxaGV6eHhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY3MzA4MywiZXhwIjoyMDgzMjQ5MDgzfQ.lx7Ehh_zeC4GS8FxgFcT-Tiqgx0O4QHyEU-0vK2YdHM';

const server = http.createServer(async (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { employee_id, password } = JSON.parse(body);
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 사용자 조회
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('employee_id', employee_id)
          .single();

        if (userError || !user) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: { message: '사원번호 또는 비밀번호가 일치하지 않습니다.' } }));
          return;
        }

        // 비밀번호 검증
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: { message: '사원번호 또는 비밀번호가 일치하지 않습니다.' } }));
          return;
        }

        // 성공
        const { password_hash, ...userWithoutPassword } = user;
        
        const sessionData = JSON.stringify({
          id: user.id,
          employee_id: user.employee_id,
          role: user.role,
          team: user.team,
        });

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Set-Cookie': [
            `user_id=${user.id}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
            `user_session=${encodeURIComponent(sessionData)}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
          ]
        });
        res.end(JSON.stringify({ 
          success: true, 
          data: { user: userWithoutPassword, isFirstLogin: user.is_first_login } 
        }));
      } catch (error) {
        console.error('Login error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { message: '서버 오류' } }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('✅ Simple login server running on http://localhost:3000');
  console.log('📝 Test with: EMP001 / password123');
});
