/**
 * Design tokens for the demo.
 * The `tw` palette + radii are sampled from the Tripworks CRM reference screenshot so
 * the new Intent column and KPI card look native. The `maui` palette styles the
 * operator's customer-facing website, which is intentionally a different brand.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        tw: {
          ink: '#171A26', // headings, names, numbers
          body: '#3B4152', // table body text
          muted: '#7A8194', // secondary text, header labels
          faint: '#A6ACBA', // placeholder, help icons
          border: '#ECEEF2', // 1px soft borders
          line: '#F1F2F5', // row dividers
          wash: '#F6F7F9', // page wash
          head: '#F8F9FB', // table header band
          input: '#F3F4F6', // filled search input
          purple: '#A259F7', // avatar squares
          red: '#EF4444',
          orange: '#F59E0B',
          blue: '#3B82F6',
          green: '#22C55E',
          greenText: '#16A34A',
          flame: '#F97316',
        },
        tile: {
          green: '#DCFCE7',
          blue: '#DBEAFE',
          yellow: '#FEF3C7',
          cyan: '#CFF3FA',
          orange: '#FFEDD5',
        },
        maui: {
          sea: '#0E7490',
          deep: '#0B3B4A',
          sand: '#FBF6EE',
          coral: '#F0643C',
          palm: '#1F6F4A',
        },
      },
      borderRadius: {
        card: '16px',
        tile: '12px',
        ctl: '10px', // inputs, chips, pills
        avatar: '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.03)',
        drawer: '-24px 0 48px -12px rgba(16, 24, 40, 0.18)',
        glow: '0 0 0 2px rgba(249, 115, 22, 0.35), 0 8px 24px -6px rgba(249, 115, 22, 0.35)',
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.55)' },
          '70%': { boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
};
