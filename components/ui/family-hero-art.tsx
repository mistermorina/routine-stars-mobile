import React from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
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
  opacity = 0.92,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
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
      opacity={opacity}
    />
  );
}

function Person({
  x,
  y,
  scale = 1,
  skin,
  hair,
  outfit,
  accent,
  longHair = false,
}: {
  x: number;
  y: number;
  scale?: number;
  skin: string;
  hair: string;
  outfit: string;
  accent: string;
  longHair?: boolean;
}) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Circle cx="0" cy="-18" r="15" fill={skin} />
      {longHair ? (
        <>
          <Path
            d="M -18 -20 C -16 -40 16 -42 18 -18 L 18 -6 C 14 4 8 8 0 8 C -8 8 -14 4 -18 -6 Z"
            fill={hair}
          />
          <Path
            d="M -14 -6 C -18 8 -18 20 -10 28"
            stroke={hair}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <Path
          d="M -17 -18 C -14 -38 16 -40 18 -18 L 18 -8 L -17 -8 Z"
          fill={hair}
        />
      )}
      <Rect x="-17" y="0" width="34" height="30" rx="14" fill={outfit} />
      <Path
        d="M -26 12 C -22 6 -14 2 -9 2 C -7 8 -7 12 -8 18"
        stroke={outfit}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <Path
        d="M 26 12 C 22 6 14 2 9 2 C 7 8 7 12 8 18"
        stroke={accent}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <Circle cx="-5" cy="-19" r="1.5" fill="#231B37" />
      <Circle cx="5" cy="-19" r="1.5" fill="#231B37" />
      <Path
        d="M -5 -11 C -2 -8 2 -8 5 -11"
        stroke="#231B37"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );
}

function SceneCard({
  x,
  y,
  width,
  height,
  label,
  labelFill,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  labelFill: string;
  children: React.ReactNode;
}) {
  return (
    <G>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="24"
        fill="rgba(255,255,255,0.86)"
      />
      <Rect
        x={x + 10}
        y={y + height - 28}
        width={Math.max(56, label.length * 6.6)}
        height="18"
        rx="9"
        fill={labelFill}
      />
      <SvgText
        x={x + 18}
        y={y + height - 15}
        fontSize="9.5"
        fill="#24405C"
        fontWeight="700"
      >
        {label}
      </SvgText>
      {children}
    </G>
  );
}

export function FamilyHeroArt({
  theme,
  compact = false,
  className,
}: FamilyHeroArtProps) {
  const palette = getThemePalette(theme);
  const height = compact ? 176 : 248;

  return (
    <View
      className={cn("overflow-hidden rounded-[30px] border", className)}
      style={{
        height,
        borderColor: palette.accentBorder,
        backgroundColor: palette.heroSurface,
      }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 340 230"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <LinearGradient id="familyHeroGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.screenGradient[0]} />
            <Stop offset="0.52" stopColor={palette.screenGradient[1]} />
            <Stop offset="1" stopColor={palette.screenGradient[2]} />
          </LinearGradient>
          <LinearGradient id="familyWindow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F8FCFF" />
            <Stop offset="1" stopColor="#E9F3FF" />
          </LinearGradient>
          <LinearGradient id="gardenSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#9ED9FF" />
            <Stop offset="1" stopColor="#EAF9FF" />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width="340" height="230" fill="url(#familyHeroGlow)" />
        <Circle cx="34" cy="36" r="30" fill={palette.motifPrimary} opacity="0.34" />
        <Circle cx="298" cy="20" r="36" fill={palette.motifSecondary} opacity="0.32" />
        <Circle cx="314" cy="208" r="44" fill={palette.motifPrimary} opacity="0.22" />
        <Circle cx="18" cy="198" r="24" fill={palette.motifSecondary} opacity="0.22" />
        <Ellipse cx="170" cy="216" rx="112" ry="24" fill="#FFFFFF" opacity="0.38" />

        <SceneCard
          x={18}
          y={18}
          width={196}
          height={194}
          label="Zusammen"
          labelFill={palette.tabActiveBg}
        >
          <Rect x="34" y="34" width="164" height="126" rx="26" fill="#FFF8F0" />
          <Rect x="48" y="42" width="136" height="74" rx="20" fill="url(#familyWindow)" />
          <Path
            d="M 52 46 C 70 34 92 34 108 44"
            stroke="#DCEBFF"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Path
            d="M 126 46 C 146 32 170 34 184 50"
            stroke="#DCEBFF"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Rect x="110" y="42" width="4" height="74" fill="#DFE8F4" />
          <Rect x="48" y="116" width="136" height="12" rx="6" fill="#E7D9CC" />
          <Sparkle x={174} y={58} size={11} color={palette.chartPrimary} opacity={0.6} />
          <Person
            x={78}
            y={126}
            scale={1.1}
            skin="#F7D3B1"
            hair="#3D2C44"
            outfit="#DDE8FF"
            accent="#DDE8FF"
            longHair
          />
          <Person
            x={120}
            y={120}
            scale={1.14}
            skin="#FFD9B8"
            hair="#C18A4A"
            outfit="#FFF1E0"
            accent="#FFF1E0"
            longHair
          />
          <Person
            x={156}
            y={118}
            scale={1.12}
            skin="#F3C39F"
            hair="#27384F"
            outfit="#5F6F9A"
            accent="#5F6F9A"
          />
          <Person
            x={186}
            y={128}
            scale={0.9}
            skin="#F2C3A0"
            hair="#7A4B2E"
            outfit="#EDF3FF"
            accent="#EDF3FF"
          />
        </SceneCard>

        <SceneCard
          x={225}
          y={18}
          width={97}
          height={58}
          label="Spiel"
          labelFill="#FFF1B8"
        >
          <Rect x="236" y="28" width="75" height="20" rx="10" fill="url(#gardenSky)" />
          <Rect x="236" y="44" width="75" height="16" rx="8" fill="#BFE7B4" />
          <Circle cx="302" cy="34" r="7" fill="#FFE37A" />
          <Path
            d="M 244 44 C 248 38 260 38 264 44"
            stroke="#6BB56F"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Circle cx="278" cy="46" r="10" fill="#FFB24D" />
          <Path d="M 272 44 L 284 48" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M 278 36 L 278 56" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </SceneCard>

        <SceneCard
          x={225}
          y={86}
          width={97}
          height={58}
          label="Zaehne"
          labelFill="#DFF1FF"
        >
          <Rect x="236" y="96" width="75" height="34" rx="12" fill="#E6F5FF" />
          <Rect x="248" y="104" width="24" height="16" rx="6" fill="#FFFFFF" />
          <Rect x="274" y="108" width="24" height="18" rx="7" fill="#FFFDF9" />
          <Rect x="262" y="118" width="4" height="8" rx="2" fill="#B7C8D8" />
          <Path
            d="M 280 115 C 284 109 292 109 296 115"
            stroke="#9ED5F8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 289 114 L 296 111"
            stroke="#5BA6D6"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </SceneCard>

        <SceneCard
          x={225}
          y={154}
          width={97}
          height={58}
          label="Lernen"
          labelFill="#FBE1C8"
        >
          <Rect x="238" y="166" width="71" height="30" rx="12" fill="#FFF8F1" />
          <Rect x="245" y="182" width="56" height="6" rx="3" fill="#DBBE96" />
          <Rect x="250" y="171" width="24" height="10" rx="3" fill="#FFFFFF" />
          <Circle cx="296" cy="172" r="8" fill="#9ED1F2" />
          <Path
            d="M 296 164 L 296 180"
            stroke="#5A95C0"
            strokeWidth="1.8"
          />
          <Path
            d="M 289 172 C 294 170 298 170 303 172"
            stroke="#5A95C0"
            strokeWidth="1.8"
          />
          <Path
            d="M 264 174 C 268 168 276 168 280 174"
            stroke="#E3B774"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </SceneCard>

        <Rect x="152" y="28" width="44" height="18" rx="9" fill="rgba(255,255,255,0.82)" />
        <Circle cx="165" cy="37" r="4" fill={palette.chartPrimary} />
        <Circle cx="176" cy="37" r="4" fill={palette.chartSecondary} />
        <Circle cx="187" cy="37" r="4" fill={palette.accentStrong} />

        <Sparkle x={20} y={86} size={12} color={palette.chartPrimary} opacity={0.7} />
        <Sparkle x={318} y={146} size={14} color={palette.chartSecondary} opacity={0.72} />
        <Sparkle x={108} y={204} size={12} color={palette.chartPrimary} opacity={0.64} />
        <Sparkle x={220} y={90} size={10} color={palette.chartSecondary} opacity={0.72} />
      </Svg>
    </View>
  );
}
