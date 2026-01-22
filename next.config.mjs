/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 프로덕션 빌드 시 ESLint 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 프로덕션 빌드 시 타입 체크 무시
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
