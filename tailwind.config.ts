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
        body: ["Poppins_400Regular"],
        "body-semibold": ["Poppins_600SemiBold"],
        "body-bold": ["Poppins_700Bold"],
        headline: ["Poppins_700Bold"],
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
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#245A74",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
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
      },
    },
  },
  plugins: [],
} satisfies Config;
