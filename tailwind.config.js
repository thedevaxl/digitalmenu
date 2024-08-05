/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        warmCozy: {
          "primary": "#FFB385",
          "secondary": "#FF6663",
          "accent": "#FFD275",
          "neutral": "#FFF8E7",
          "base-100": "#2B2B2B",
        },
      },
      {
        freshModern: {
          "primary": "#A8DADC",
          "secondary": "#457B9D",
          "accent": "#E63946",
          "neutral": "#F1FAEE",
          "base-100": "#1D3557",
        },
      },
      {
        earthyNatural: {
          "primary": "#D4A373",
          "secondary": "#81B29A",
          "accent": "#E07A5F",
          "neutral": "#F4F1DE",
          "base-100": "#3D405B",
        },
      },
      {
        brightCheerful: {
          "primary": "#F8B400",
          "secondary": "#FF616D",
          "accent": "#29A19C",
          "neutral": "#F6F6F6",
          "base-100": "#333333",
        },
      },
      {
        rusticWarm: {
          "primary": "#A47148",
          "secondary": "#E85A4F",
          "accent": "#FFB997",
          "neutral": "#EFE6DD",
          "base-100": "#403D39",
        },
      },
      // Additional themes can be added here
    ],
  },
}
