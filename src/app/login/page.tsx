/**
 * 로그인 페이지 - Microsoft Fluent Design 2.0
 * - Neumorphism Level 4 (Heavy depth)
 * - Glassmorphism Level 2 (Subtle)
 * - Animation Level 3 (Moderate)
 * - Blue color scheme (시인성 최적화)
 * - 완벽한 반응형 디자인 (Desktop → Mobile)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fluentColors, fluentShadows, fluentGlass, fluentRadius } from '@/styles/fluent';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function FluentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profile) {
          if (profile.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      }
    } catch (error: any) {
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.background}>
        {/* Floating shapes */}
        <div style={{...styles.floatingShape, ...styles.shape1}} />
        <div style={{...styles.floatingShape, ...styles.shape2}} />
        <div style={{...styles.floatingShape, ...styles.shape3}} />
      </div>

      {/* Main Content */}
      <div className="content" style={styles.content}>
        {/* Left Section - Hero (Desktop only) */}
        <div className="left-section" style={{...styles.leftSection, opacity: mounted ? 1 : 0}}>
          <div style={styles.heroContent}>
            <div style={styles.logoContainer}>
              <BusinessIcon style={styles.logoIcon} />
              <AutoAwesomeIcon style={styles.sparkleIcon} />
            </div>
            <h1 className="hero-title" style={styles.heroTitle}>아마노코리아</h1>
            <h2 className="hero-subtitle" style={styles.heroSubtitle}>업무 관리 시스템</h2>
            <p className="hero-description" style={styles.heroDescription}>
              효율적인 업무 흐름으로<br />
              팀의 생산성을 극대화하세요
            </p>
            
            {/* Feature badges */}
            <div style={styles.featureBadges}>
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>📊</span>
                <span style={styles.badgeText}>실시간 통계</span>
              </div>
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>🚀</span>
                <span style={styles.badgeText}>빠른 협업</span>
              </div>
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>🔒</span>
                <span style={styles.badgeText}>안전한 관리</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Card */}
        <div className="right-section" style={{...styles.rightSection, opacity: mounted ? 1 : 0}}>
          <div className="login-card" style={styles.loginCard}>
            {/* Card Header */}
            <div style={styles.cardHeader}>
              <h3 className="card-title" style={styles.cardTitle}>로그인</h3>
              <p className="card-subtitle" style={styles.cardSubtitle}>계정 정보를 입력해주세요</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div style={styles.errorAlert}>
                <span style={styles.errorIcon}>⚠️</span>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} style={styles.form}>
              {/* Email Input */}
              <div style={styles.inputGroup}>
                <label className="input-label" style={styles.inputLabel}>이메일</label>
                <div style={styles.inputWrapper}>
                  <EmailIcon className="input-icon" style={styles.inputIcon} />
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@amano.co.kr"
                    required
                    style={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={styles.inputGroup}>
                <label className="input-label" style={styles.inputLabel}>비밀번호</label>
                <div style={styles.inputWrapper}>
                  <LockIcon className="input-icon" style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={styles.input}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff style={styles.eyeIcon} /> : <Visibility style={styles.eyeIcon} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={styles.formOptions}>
                <label style={styles.rememberLabel}>
                  <input type="checkbox" style={styles.checkbox} />
                  <span style={styles.rememberText}>로그인 상태 유지</span>
                </label>
                <button type="button" style={styles.forgotButton}>
                  비밀번호 찾기
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.submitButtonLoading : {}),
                }}
              >
                {loading ? (
                  <div style={styles.loadingSpinner}>
                    <div style={styles.spinner} />
                    <span>로그인 중...</span>
                  </div>
                ) : (
                  '로그인'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Responsive Media Queries */
        @media (max-width: 1200px) {
          .content {
            gap: 40px;
          }
          .hero-title {
            font-size: 42px;
          }
          .hero-subtitle {
            font-size: 24px;
          }
          .hero-description {
            font-size: 16px;
          }
        }

        @media (max-width: 1024px) {
          /* Tablet */
          .left-section {
            max-width: 400px;
          }
          .hero-title {
            font-size: 36px;
          }
          .hero-subtitle {
            font-size: 20px;
          }
          .hero-description {
            font-size: 15px;
          }
          .login-card {
            padding: 40px 32px;
          }
        }

        @media (max-width: 768px) {
          /* Mobile */
          .left-section {
            display: none !important;
          }
          .content {
            padding: 24px 16px;
            gap: 0;
          }
          .right-section {
            max-width: 100%;
          }
          .login-card {
            padding: 32px 24px;
            border-radius: 20px;
          }
          .card-title {
            font-size: 24px;
          }
          .card-subtitle {
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          /* Small Mobile */
          .content {
            padding: 16px 12px;
          }
          .login-card {
            padding: 24px 20px;
            border-radius: 16px;
          }
          .card-title {
            font-size: 20px;
          }
          .card-subtitle {
            font-size: 12px;
          }
          .input-label {
            font-size: 12px;
          }
          .input {
            padding: 14px 14px 14px 48px;
            font-size: 14px;
          }
          .input-icon {
            font-size: 18px;
            left: 14px;
          }
          .submit-button {
            padding: 16px;
            font-size: 14px;
          }
          .quick-button {
            padding: 14px;
          }
          .quick-button-icon {
            font-size: 28px;
          }
          .quick-button-text {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${fluentColors.primary[300]} 0%, ${fluentColors.primary[500]} 50%, ${fluentColors.primary[700]} 100%)`,
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    zIndex: 0,
  },

  floatingShape: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    animation: 'float 8s ease-in-out infinite',
  },

  shape1: {
    width: '300px',
    height: '300px',
    top: '10%',
    left: '5%',
    animationDelay: '0s',
  },

  shape2: {
    width: '200px',
    height: '200px',
    top: '60%',
    right: '10%',
    animationDelay: '2s',
  },

  shape3: {
    width: '150px',
    height: '150px',
    bottom: '10%',
    left: '50%',
    animationDelay: '4s',
  },

  content: {
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '60px',
  } as React.CSSProperties,

  '@media (max-width: 768px)': {
    content: {
      padding: '24px 16px',
      gap: 0,
    },
  } as any,

  leftSection: {
    flex: '1 1 50%',
    maxWidth: '600px',
    transition: 'opacity 0.8s ease-out',
  } as React.CSSProperties,

  heroContent: {
    color: '#FFFFFF',
  },

  logoContainer: {
    position: 'relative',
    width: '80px',
    height: '80px',
    marginBottom: '24px',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: fluentShadows.acrylic,
  },

  logoIcon: {
    fontSize: '40px',
    color: '#FFFFFF',
  },

  sparkleIcon: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    fontSize: '24px',
    color: '#FFD700',
    animation: 'pulse 2s ease-in-out infinite',
  },

  heroTitle: {
    fontSize: '48px',
    fontWeight: 700,
    marginBottom: '12px',
    letterSpacing: '-1px',
    lineHeight: 1.2,
  },

  heroSubtitle: {
    fontSize: '28px',
    fontWeight: 400,
    marginBottom: '24px',
    opacity: 0.9,
  },

  heroDescription: {
    fontSize: '18px',
    lineHeight: 1.6,
    opacity: 0.85,
    marginBottom: '40px',
  },

  featureBadges: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },

  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: fluentRadius.lg,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  badgeIcon: {
    fontSize: '20px',
  },

  badgeText: {
    fontSize: '14px',
    fontWeight: 500,
  },

  rightSection: {
    flex: '0 0 auto',
    maxWidth: '480px',
    width: '100%',
    transition: 'opacity 0.8s ease-out 0.2s',
  } as React.CSSProperties,

  loginCard: {
    background: fluentColors.neutral[0],
    borderRadius: fluentRadius.xxl,
    padding: '48px',
    boxShadow: fluentShadows.neumorph4,
    position: 'relative',
  } as React.CSSProperties,

  cardHeader: {
    marginBottom: '32px',
    textAlign: 'center',
  },

  cardTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: fluentColors.neutral[100],
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  } as React.CSSProperties,

  cardSubtitle: {
    fontSize: '15px',
    color: fluentColors.neutral[60],
  } as React.CSSProperties,

  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    marginBottom: '24px',
    background: 'rgba(211, 47, 47, 0.1)',
    border: `1px solid ${fluentColors.error.light}`,
    borderRadius: fluentRadius.md,
    animation: 'fadeInUp 0.3s ease-out',
  },

  errorIcon: {
    fontSize: '20px',
  },

  errorText: {
    fontSize: '14px',
    color: fluentColors.error.dark,
    flex: 1,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  inputLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: fluentColors.neutral[80],
    marginBottom: '4px',
  } as React.CSSProperties,

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: fluentColors.neutral[10],
    borderRadius: fluentRadius.md,
    border: `2px solid ${fluentColors.neutral[30]}`,
    transition: 'all 0.3s ease',
    boxShadow: fluentShadows.neumorph1,
  },

  inputIcon: {
    position: 'absolute',
    left: '16px',
    fontSize: '20px',
    color: fluentColors.primary[500],
    pointerEvents: 'none',
  } as React.CSSProperties,

  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    padding: '16px 16px 16px 52px',
    fontSize: '15px',
    color: fluentColors.neutral[100],
    fontWeight: 500,
  } as React.CSSProperties,

  passwordToggle: {
    border: 'none',
    background: 'transparent',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyeIcon: {
    fontSize: '20px',
    color: fluentColors.neutral[60],
  },

  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-8px',
    flexWrap: 'wrap',
    gap: '8px',
  },

  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },

  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: fluentColors.primary[500],
  },

  rememberText: {
    fontSize: '14px',
    color: fluentColors.neutral[70],
  },

  forgotButton: {
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: fluentColors.primary[600],
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: fluentRadius.sm,
    transition: 'all 0.2s ease',
  },

  submitButton: {
    width: '100%',
    padding: '18px',
    border: 'none',
    borderRadius: fluentRadius.md,
    background: `linear-gradient(135deg, ${fluentColors.primary[500]} 0%, ${fluentColors.primary[700]} 100%)`,
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: fluentShadows.neumorph2,
    transition: 'all 0.3s ease',
    marginTop: '8px',
  } as React.CSSProperties,

  submitButtonLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },

  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },

  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #FFFFFF',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
