import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
    extend: {
      screens: {
        // Mobile-first breakpoints
        'xs': '375px',
        // Default sm is 640px
        // Default md is 768px (tablet portrait)
        'tablet': '768px',
        'lg': '1024px', // tablet landscape / small laptop
        'xl': '1280px', // desktop
        '2xl': '1536px', // large desktop
        // Touch device detection
        'touch': { 'raw': '(hover: none)' },
        'hover': { 'raw': '(hover: hover)' },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
        'base': '8px',
        'sidebar_width': '280px',
        'card_padding': '20px',
        'stack_gap': '16px',
        'margin_edge': '32px',
        'gutter': '24px',
      },
      fontSize: {
        // Base sizes - slightly larger for better readability
        'xs': ['0.8125rem', { lineHeight: '1.25rem' }], // 13px
        'sm': ['0.875rem', { lineHeight: '1.375rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }], // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
        // Mockup specific font sizes
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '500' }]
      },
      fontFamily: {
        sans: [
          'Source Sans Pro',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif'
        ],
        serif: [
          'Source Serif Pro',
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif'
        ],
        mono: [
          'Source Code Pro',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ],
        // Mockup specific font families
        'label-sm-mock': ['JetBrains Mono'],
        'headline-lg-mock': ['Hanken Grotesk'],
        'body-lg-mock': ['Inter'],
        'headline-md-mock': ['Hanken Grotesk'],
        'body-md-mock': ['Inter'],
        'display-lg-mock': ['Hanken Grotesk'],
        'label-md-mock': ['JetBrains Mono']
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          '50': '#eef2ff',
          '100': '#e0e7ff',
          '200': '#c7d2fe',
          '300': '#a5b4fc',
          '400': '#818cf8',
          '500': '#6366f1',
          '600': '#4f46e5',
          '700': '#4338ca',
          '800': '#3730a3',
          '900': '#312e81',
          DEFAULT: 'hsl(var(--primary))',
          light: 'hsl(var(--primary-light))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          amber: 'hsl(var(--accent-amber))',
          yellow: 'hsl(var(--accent-yellow))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Mockup specific color palette mapping
        'surface': 'hsl(var(--surface))',
        'on-surface': 'hsl(var(--on-surface))',
        'on-surface-variant': 'hsl(var(--on-surface-variant))',
        'inverse-on-surface': '#2a3040',
        'on-primary-fixed-variant': '#6e3900',
        'on-tertiary-fixed': '#001e2c',
        'surface-tint': '#ffb77d',
        'outline-variant': 'hsl(var(--outline-variant))',
        'on-error': '#690005',
        'primary-fixed-dim': '#ffb77d',
        'on-secondary-fixed': '#25005a',
        'error-container': '#93000a',
        'primary-fixed': '#ffdcc3',
        'secondary-fixed-dim': '#d2bbff',
        'on-error-container': '#ffdad6',
        'inverse-surface': '#dde2f8',
        'surface-dim': '#0d1322',
        'inverse-primary': '#904d00',
        'surface-variant': 'hsl(var(--surface-variant))',
        'tertiary-container': '#2ab5f0',
        'surface-container': 'hsl(var(--surface-container))',
        'on-secondary-container': '#c9aeff',
        'on-primary-fixed': '#2f1500',
        'secondary-fixed': '#eaddff',
        'surface-container-low': 'hsl(var(--surface-container-low))',
        'primary-container': '#ff8c00',
        'surface-container-highest': 'hsl(var(--surface-container-highest))',
        'on-primary-container': '#623200',
        'tertiary': '#7bd0ff',
        'on-tertiary-container': '#00435d',
        'secondary-container': '#6001d1',
        'on-tertiary': '#00354a',
        'tertiary-fixed-dim': '#7bd0ff',
        'surface-container-high': 'hsl(var(--surface-container-high))',
        'surface-container-lowest': 'hsl(var(--surface-container-lowest))',
        'surface-bright': '#33394a',
        'on-primary': '#4d2600',
        'on-tertiary-fixed-variant': '#004c69',
        'on-secondary-fixed-variant': '#5a00c6',
        'on-secondary': '#3f008e',
        'tertiary-fixed': '#c4e7ff',
        'outline': 'hsl(var(--outline))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      boxShadow: {
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)'
      }
    }
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
