import React from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface FamilyHeroArtProps {
  theme?: string | null;
  compact?: boolean;
  className?: string;
}

function Sparkle({
  x,
  y,
  size,
  color,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
}) {
  const half = size / 2;
  const quarter = size / 4;

  return (
    <Path
      d={[
        `M ${x} ${y - half}`,
        `L ${x + quarter} ${y - quarter}`,
        `L ${x + half} ${y}`,
        `L ${x + quarter} ${y + quarter}`,
        `L ${x} ${y + half}`,
        `L ${x - quarter} ${y + quarter}`,
        `L ${x - half} ${y}`,
        `L ${x - quarter} ${y - quarter}`,
        "Z",
      ].join(" ")}
      fill={color}
      opacity={0.95}
    />
  );
}

export function FamilyHeroArt({
  theme,
  compact = false,
  className,
}: FamilyHeroArtProps) {
  const palette = getThemePalette(theme);
  const height = compact ? 148 : 214;

  return (
    <View
      className={cn("overflow-hidden rounded-[28px] border", className)}
      style={{
        height,
        borderColor: palette.accentBorder,
        backgroundColor: palette.heroSurface,
      }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 320 220"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <LinearGradient id="heroGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.screenGradient[0]} />
            <Stop offset="0.55" stopColor={palette.screenGradient[1]} />
            <Stop offset="1" stopColor={palette.screenGradient[2]} />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width="320" height="220" fill="url(#heroGlow)" />
        <Circle cx="48" cy="48" r="36" fill={palette.motifPrimary} opacity="0.42" />
        <Circle cx="278" cy="38" r="30" fill={palette.motifSecondary} opacity="0.28" />
        <Circle cx="292" cy="186" r="42" fill={palette.motifSecondary} opacity="0.22" />
        <Circle cx="22" cy="192" r="28" fill={palette.motifPrimary} opacity="0.2" />

        <Rect
          x="32"
          y="32"
          width="256"
          height="156"
          rx="34"
          fill="rgba(255,255,255,0.74)"
        />
        <Rect
          x="48"
          y="46"
          width="72"
          height="34"
          rx="16"
          fill="rgba(255,255,255,0.82)"
        />
        <Rect
          x="224"
          y="54"
          width="52"
          height="52"
          rx="18"
          fill="rgba(255,255,255,0.84)"
        />
        <Rect
          x="228"
          y="58"
          width="44"
          height="44"
          rx="16"
          fill={palette.accentSoft}
        />
        <Sparkle x={250} y={80} size={18} color={palette.chartPrimary} />

        <Rect
          x="72"
          y="88"
          width="176"
          height="82"
          rx="28"
          fill="rgba(255,255,255,0.82)"
        />
        <Ellipse cx="160" cy="176" rx="94" ry="17" fill={palette.accentSoft} opacity="0.85" />

        <Sparkle x={64} y={110} size={14} color={palette.chartPrimary} />
        <Sparkle x={266} y={130} size={16} color={palette.chartSecondary} />
        <Sparkle x={210} y={34} size={12} color={palette.chartPrimary} />

        <Circle cx="114" cy="108" r="23" fill="#F6C9A8" />
        <Path
          d="M 92 107 C 94 82 132 79 136 107 L 136 112 L 92 112 Z"
          fill="#4C3D70"
        />
        <Rect x="88" y="130" width="52" height="38" rx="20" fill={palette.motifPrimary} />
        <Circle cx="108" cy="106" r="2.2" fill="#201A34" />
        <Circle cx="120" cy="106" r="2.2" fill="#201A34" />
        <Path
          d="M 108 116 C 112 120 116 120 120 116"
          stroke="#201A34"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        <Circle cx="160" cy="118" r="20" fill="#FFD9B8" />
        <Path
          d="M 142 116 C 144 92 176 92 178 116 L 178 121 L 142 121 Z"
          fill={palette.accentStrong}
        />
        <Rect x="138" y="136" width="44" height="32" rx="16" fill={palette.accent} />
        <Circle cx="154" cy="117" r="2.1" fill="#201A34" />
        <Circle cx="166" cy="117" r="2.1" fill="#201A34" />
        <Path
          d="M 154 126 C 158 130 162 130 166 126"
          stroke="#201A34"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        <Circle cx="208" cy="108" r="23" fill="#F2C3A1" />
        <Path
          d="M 186 108 C 188 79 228 82 230 108 L 230 114 L 186 114 Z"
          fill="#5D4A7D"
        />
        <Rect x="182" y="130" width="52" height="38" rx="20" fill={palette.motifSecondary} />
        <Circle cx="202" cy="106" r="2.2" fill="#201A34" />
        <Circle cx="214" cy="106" r="2.2" fill="#201A34" />
        <Path
          d="M 202 116 C 206 120 210 120 214 116"
          stroke="#201A34"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        <Rect x="58" y="54" width="54" height="18" rx="9" fill={palette.tabActiveBg} />
        <Rect x="68" y="60" width="18" height="6" rx="3" fill={palette.accentStrong} />
        <Rect x="90" y="60" width="12" height="6" rx="3" fill={palette.accentBorder} />
        <Rect x="182" y="62" width="34" height="18" rx="9" fill="rgba(255,255,255,0.84)" />
        <Circle cx="195" cy="71" r="4" fill={palette.chartPrimary} />
        <Circle cx="206" cy="71" r="4" fill={palette.chartSecondary} />
      </Svg>
    </View>
  );
}
