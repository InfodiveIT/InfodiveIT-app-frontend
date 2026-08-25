import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          DEFAULT: '#0E66FF',
          deep: '#001DFF',
          mid: '#0E5CFF',
          light: '#1469FD',
          accent: '#7aa9ff',
          tint: '#E4EAFF',
        },
        // Accents
        teal: '#46BEA3',
        indigo: '#5754FF',
        // Feedback
        danger: '#E5484D', // erros de formulário, asteriscos de campo obrigatório
        // Neutrals (overrides do gray padrão)
        ink: {
          950: '#141413', // headings, dark sections
          900: '#1A1919', // body text
          500: '#7B7B7B', // texto secundário
          300: '#BFBFBF', // placeholder
          200: '#D8D8D8', // bordas
          50:  '#FAFAFA', // bg seções alternas
        },
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        container: '1280px',
      },
      animation: {
        'marquee': 'marquee var(--marquee-duration, 35s) linear infinite',
        'marquee-reverse': 'marquee-reverse var(--marquee-duration, 35s) linear infinite',
        'orbit': 'orbit calc(var(--duration)*1s) linear infinite',
        'aurora': 'aurora 8s ease-in-out infinite alternate',
        'shine': 'shine 14s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        orbit: {
          '0%': {
            transform:
              'rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg))',
          },
          '100%': {
            transform:
              'rotate(calc(var(--angle) * 1deg + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc((var(--angle) * -1deg) - 360deg))',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
