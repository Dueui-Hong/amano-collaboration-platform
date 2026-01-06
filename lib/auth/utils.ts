// ============================================
// Authentication Utilities
// ============================================

import { User } from '@/types';
import bcrypt from 'bcryptjs';

/**
 * 비밀번호 해시 생성
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * 비밀번호 검증
 */
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * 비밀번호 강도 검증
 * 최소 8자, 영문 대소문자, 숫자, 특수문자 중 3가지 이상
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  message?: string;
} => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: '비밀번호는 최소 8자 이상이어야 합니다.',
    };
  }

  let complexityCount = 0;

  if (/[a-z]/.test(password)) complexityCount++; // 소문자
  if (/[A-Z]/.test(password)) complexityCount++; // 대문자
  if (/[0-9]/.test(password)) complexityCount++; // 숫자
  if (/[^a-zA-Z0-9]/.test(password)) complexityCount++; // 특수문자

  if (complexityCount < 3) {
    return {
      isValid: false,
      message:
        '비밀번호는 영문 대소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.',
    };
  }

  return { isValid: true };
};

/**
 * 사용자 세션 데이터 생성 (민감 정보 제외)
 */
export const sanitizeUser = (user: User): Omit<User, 'password_hash'> => {
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

/**
 * 사원번호 형식 검증 (EMP001 ~ EMP999)
 */
export const validateEmployeeId = (employeeId: string): boolean => {
  return /^EMP\d{3}$/.test(employeeId);
};

/**
 * 이메일 형식 검증
 */
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * JWT 토큰 만료 시간 계산 (7일)
 */
export const getTokenExpiration = (): number => {
  return Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
};

/**
 * 세션 갱신 필요 여부 확인 (만료 1일 전)
 */
export const shouldRefreshToken = (expiresAt: number): boolean => {
  const oneDayInSeconds = 24 * 60 * 60;
  const currentTime = Math.floor(Date.now() / 1000);
  return expiresAt - currentTime < oneDayInSeconds;
};
