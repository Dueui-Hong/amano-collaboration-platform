/**
 * Fluent Design System 2.0
 * Microsoft Fluent 스타일 기반
 * - 시인성 좋은 푸른 계열 색상
 * - Neumorphism Level 4 (Heavy)
 * - Glassmorphism Level 2 (Subtle)
 * - Animation Level 3 (Moderate)
 */

export const fluentColors = {
  // Primary Blue (Main brand color)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',  // Main
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Accent Teal
  accent: {
    400: '#26C6DA',
    500: '#00B8D4',
    600: '#00ACC1',
    700: '#0097A7',
    800: '#00838F',
  },
  
  // Neutral Grays
  neutral: {
    0: '#FFFFFF',
    10: '#FAFAFA',
    20: '#F5F5F5',
    30: '#EEEEEE',
    40: '#E0E0E0',
    50: '#BDBDBD',
    60: '#9E9E9E',
    70: '#757575',
    80: '#616161',
    90: '#424242',
    100: '#212121',
  },
  
  // Semantic Colors
  success: {
    light: '#81C784',
    main: '#00C853',
    dark: '#00A344',
  },
  warning: {
    light: '#FFD54F',
    main: '#FFB300',
    dark: '#FF8F00',
  },
  error: {
    light: '#E57373',
    main: '#D32F2F',
    dark: '#C62828',
  },
  info: {
    light: '#4FC3F7',
    main: '#0288D1',
    dark: '#01579B',
  },
  
  // Acrylic Backgrounds (Glassmorphism)
  acrylic: {
    light: 'rgba(255, 255, 255, 0.7)',
    medium: 'rgba(255, 255, 255, 0.5)',
    dark: 'rgba(249, 249, 249, 0.8)',
  },
  
  // Gradient Backgrounds
  gradients: {
    blueMesh: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    blueRadial: 'radial-gradient(circle at 50% 50%, #2196F3 0%, #1976D2 50%, #0D47A1 100%)',
    blueAngular: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
    subtleBlue: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
  },
}

// Neumorphism Shadows (Level 4 - Heavy)
export const fluentShadows = {
  // Neumorphic elevations
  neumorph1: `
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.5),
    inset 2px 2px 4px rgba(255, 255, 255, 0.2)
  `,
  neumorph2: `
    12px 12px 24px rgba(163, 177, 198, 0.7),
    -12px -12px 24px rgba(255, 255, 255, 0.6),
    inset 3px 3px 6px rgba(255, 255, 255, 0.3)
  `,
  neumorph3: `
    16px 16px 32px rgba(163, 177, 198, 0.8),
    -16px -16px 32px rgba(255, 255, 255, 0.7),
    inset 4px 4px 8px rgba(255, 255, 255, 0.4)
  `,
  neumorph4: `
    20px 20px 40px rgba(163, 177, 198, 0.9),
    -20px -20px 40px rgba(255, 255, 255, 0.8),
    inset 5px 5px 10px rgba(255, 255, 255, 0.5)
  `,
  
  // Pressed/Inset state
  neumorphPressed: `
    inset 8px 8px 16px rgba(163, 177, 198, 0.6),
    inset -8px -8px 16px rgba(255, 255, 255, 0.5)
  `,
  
  // Fluent Acrylic shadows
  acrylic: '0 8px 32px rgba(0, 0, 0, 0.12)',
  acrylicHover: '0 16px 48px rgba(0, 0, 0, 0.18)',
  
  // Standard elevations
  sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
  md: '0 4px 16px rgba(0, 0, 0, 0.12)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.18)',
}

// Glassmorphism styles (Level 2 - Subtle)
export const fluentGlass = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(30px) saturate(160%)',
    WebkitBackdropFilter: 'blur(30px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  dark: {
    background: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(40px) saturate(140%)',
    WebkitBackdropFilter: 'blur(40px) saturate(140%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
}

// Border Radius
export const fluentRadius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  full: '9999px',
}

// Spacing (8pt grid)
export const fluentSpacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
  '3xl': '48px',
  '4xl': '64px',
  '5xl': '80px',
}

// Typography
export const fluentTypography = {
  h1: {
    fontSize: '32px',
    fontWeight: 600,
    lineHeight: '40px',
    letterSpacing: '-0.5px',
  },
  h2: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: '32px',
    letterSpacing: '-0.3px',
  },
  h3: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '28px',
    letterSpacing: '-0.2px',
  },
  h4: {
    fontSize: '17px',
    fontWeight: 600,
    lineHeight: '24px',
    letterSpacing: '-0.1px',
  },
  bodyLarge: {
    fontSize: '17px',
    fontWeight: 400,
    lineHeight: '24px',
    letterSpacing: '0px',
  },
  body: {
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: '22px',
    letterSpacing: '0px',
  },
  caption: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '18px',
    letterSpacing: '0px',
  },
  small: {
    fontSize: '11px',
    fontWeight: 400,
    lineHeight: '16px',
    letterSpacing: '0px',
  },
}

// Animations (Level 3 - Moderate)
export const fluentAnimations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Fluent easing functions
  easing: {
    easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
    easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',
    easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  // Keyframes
  keyframes: {
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    scaleIn: `
      @keyframes scaleIn {
        from { 
          opacity: 0;
          transform: scale(0.9);
        }
        to { 
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
    slideUp: `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    slideDown: `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    float: `
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }
    `,
    pulse: `
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
    `,
    shimmer: `
      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }
    `,
  },
}

// Transition utilities
export const fluentTransitions = {
  all: `all ${fluentAnimations.duration.normal} ${fluentAnimations.easing.easeOut}`,
  transform: `transform ${fluentAnimations.duration.normal} ${fluentAnimations.easing.easeOut}`,
  opacity: `opacity ${fluentAnimations.duration.fast} ${fluentAnimations.easing.easeOut}`,
  colors: `background-color ${fluentAnimations.duration.normal} ${fluentAnimations.easing.easeOut}, color ${fluentAnimations.duration.normal} ${fluentAnimations.easing.easeOut}`,
  shadow: `box-shadow ${fluentAnimations.duration.normal} ${fluentAnimations.easing.easeOut}`,
}

// Z-index layers
export const fluentZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}

export default {
  colors: fluentColors,
  shadows: fluentShadows,
  glass: fluentGlass,
  radius: fluentRadius,
  spacing: fluentSpacing,
  typography: fluentTypography,
  animations: fluentAnimations,
  transitions: fluentTransitions,
  zIndex: fluentZIndex,
}
