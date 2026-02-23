/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Dashboard v2 design tokens */
        bg: 'var(--bg)',
        s1: 'var(--s1)',
        s2: 'var(--s2)',
        b1: 'var(--b1)',
        b2: 'var(--b2)',
        text: 'var(--text)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'hsl(var(--muted-foreground))',
        },
        muted2: 'var(--muted2)',
        gold: 'var(--gold)',
        'gold-lt': 'var(--gold-lt)',
        green: 'var(--green)',
        /* Legacy */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

