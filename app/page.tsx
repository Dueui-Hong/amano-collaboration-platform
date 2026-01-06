import { redirect } from 'next/navigation';

export default function Home() {
  // 홈페이지 접속 시 로그인 페이지로 자동 리다이렉트
  redirect('/login');
}
