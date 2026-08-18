/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    spacing: {
      px: '1px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      12: '48px',
    },
    extend: {
      colors: {
        // shadcn/Reusables colors (CSS vars)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Forgd-specific tokens
        base: '#121212',
        surface: '#1C1C1E',
        'surface-raised': '#242426',
        subtle: '#2E2E30',
        disabled: '#5C5C5E',
        'accent-pressed': '#E85A28',
        'accent-subtle': '#FF6B3520',
        success: '#4CAF7D',
        danger: '#E5484D',
        warning: '#E8A23D',
      },
      fontFamily: {
        'inter-regular': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
      fontSize: {
        display: ['28px', { lineHeight: '34px', fontWeight: '700' }],
        heading: ['20px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['15px', { lineHeight: '21px', fontWeight: '400' }],
        'body-strong': ['15px', { lineHeight: '21px', fontWeight: '600' }],
        caption: ['13px', { lineHeight: '18px', fontWeight: '400' }],
        micro: ['11px', { lineHeight: '15px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
