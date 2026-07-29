import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
  // NativeWind exposes its Tailwind preset as CommonJS in this project version.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        body: ["Inter_400Regular"],
        "body-semibold": ["Inter_600SemiBold"],
        "body-bold": ["Inter_700Bold"],
        headline: ["InstrumentSerif_400Regular"],
      },
      colors: {
        background: "#F8E9D7",
        foreground: "#1a1a2e",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1a1a2e",
        },
        primary: {
          DEFAULT: "#F3E5AB",
          foreground: "#1a1a2e",
        },
        secondary: {
          DEFAULT: "#F0F0F0",
          foreground: "#1a1a2e",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          // Dark enough to survive a saturated gradient underneath: 8.86:1 on
          // white, and still above AA over every screen ramp's content band.
          // The old #737373 was 4.74:1 on white and only 3.90:1 on the glass
          // ramp, i.e. already failing in the lower half of every screen.
          foreground: "#4A4A4A",
        },
        accent: {
          DEFAULT: "#245A74",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
          soft: "#FDECEC",
          // AA-safe surface for destructive CTAs (white text: 9.14:1).
          strong: "#8A1F1F",
        },
        // Semantic status tokens — mirrored 1:1 in lib/theme.ts `semanticColors`.
        // DEFAULT = fill/indicator only (never text), soft = tinted surface,
        // foreground = text on soft surfaces, strong = AA-safe text on white.
        success: {
          DEFAULT: "#4FD17A",
          soft: "#ECFDF5",
          foreground: "#1F8A4C",
          strong: "#18773F",
        },
        warning: {
          DEFAULT: "#F7A313",
          soft: "#FEF3C7",
          foreground: "#92400E",
        },
        border: "#E5E5E5",
        input: "#E5E5E5",
        ring: "#87CEEB",
        gold: "#FFD700",
        "vanilla-yellow": "#F3E5AB",
        "light-apricot": "#F8E9D7",
        "sky-blue": "#87CEEB",
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
        // Design-system radii (docs/ai/DESIGN_DIRECTION.md): cards 22, tiles 18, chips 14
        card: "22px",
        tile: "18px",
        chip: "14px",
      },
    },
  },
  plugins: [],
} satisfies Config;
