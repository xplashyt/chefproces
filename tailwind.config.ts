import type { Config } from 'tailwindcss';

/**
 * Paleta tomada de una cocina real: tomate, mostaza/azafrán, albahaca, masa de
 * pan y carbón de sartén. No hay azules corporativos a propósito: el sitio debe
 * "oler" a cocina antes de que la usuaria lea una sola palabra.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tomate: {
          50: '#fff1ef',
          100: '#ffdfd9',
          200: '#ffbcb0',
          300: '#fb8f7e',
          400: '#f05f4c',
          500: '#d93a28',
          600: '#b52a1c',
          700: '#8f2115',
          800: '#6b1a11',
          900: '#4a130c',
        },
        mostaza: {
          50: '#fff8e6',
          100: '#ffeebc',
          200: '#ffdd84',
          300: '#fbc94a',
          400: '#f1b01f',
          500: '#d8940c',
          600: '#ac7008',
          700: '#7f520a',
          800: '#573a0b',
          900: '#3a2708',
        },
        albahaca: {
          50: '#eefaf1',
          100: '#d3f2dc',
          200: '#a6e2ba',
          300: '#6fc98f',
          400: '#41ab68',
          500: '#2b8c50',
          600: '#1f6f40',
          700: '#1a5734',
          800: '#164329',
          900: '#0f2c1c',
        },
        masa: {
          50: '#fffdf8',
          100: '#fff8ec',
          200: '#fbeed8',
          300: '#f3ddbd',
          400: '#e6c69b',
          500: '#d3a875',
          600: '#b78655',
          700: '#946743',
          800: '#6f4d33',
          900: '#4b3423',
        },
        carbon: {
          50: '#f6f4f3',
          100: '#e7e2e0',
          200: '#c9c0bc',
          300: '#a59893',
          400: '#7d6e69',
          500: '#5d4f4a',
          600: '#463b37',
          700: '#342b28',
          800: '#241d1b',
          900: '#171211',
        },
      },
      fontFamily: {
        // Pila del sistema: cero peticiones a Google Fonts, cero FOUT, cero
        // saltos de layout por carga de tipografías.
        sistema: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI Variable Display',
          'Segoe UI',
          'Inter',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        olla: '2rem',
      },
      boxShadow: {
        // Sombra cálida (no gris) para que las tarjetas parezcan papel sobre
        // una mesa de madera y no cajas de dashboard.
        plato: '0 18px 40px -18px rgba(107, 26, 17, 0.35)',
        'plato-alta': '0 30px 70px -24px rgba(107, 26, 17, 0.45)',
      },
      keyframes: {
        vapor: {
          '0%': { opacity: '0', transform: 'translateY(6px) scaleX(0.85)' },
          '35%': { opacity: '0.65' },
          '100%': { opacity: '0', transform: 'translateY(-22px) scaleX(1.25)' },
        },
        flotar: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(4deg)' },
        },
        'girar-lento': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        burbuja: {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '40%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-18px) scale(1)', opacity: '0' },
        },
      },
      animation: {
        vapor: 'vapor 3.4s ease-in-out infinite',
        flotar: 'flotar 6s ease-in-out infinite',
        'girar-lento': 'girar-lento 22s linear infinite',
        burbuja: 'burbuja 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
