import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ChevronRight, Sparkles } from "@/lib/icons";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card } from "@/components/ui/card";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Progress } from "@/components/ui/progress";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  STICKER_CATALOG,
  getStickerRarityLabel,
  getStickerThemeWorldLabel,
  type AnimalSticker,
} from "@/lib/animal-stickers";
import { enterFade, enterStagger, springs, timings } from "@/lib/motion";
import { semanticColors, type ThemePalette } from "@/lib/theme";
import type { StickerAssetId, StickerCollectionEntry } from "@/lib/types";

/**
 * Tile geometry. These constants are the single source of truth for both the
 * embedded preview grid and the virtualized gallery — `getItemLayout` below
 * derives the row height from them, so any change here keeps scrolling exact.
 */
const TILE_BOX_HEIGHT = 78;
const TILE_IMAGE_SIZE = 62;
const TILE_LABEL_GAP = 4;
const TILE_LABEL_HEIGHT = 20;
const TILE_ROW_GAP = 12;
const COMPACT_WIDTH_BREAKPOINT = 380;
/** Above this the gallery adds columns instead of stretching tiles (iPad / split view). */
const WIDE_WIDTH_BREAKPOINT = 700;
const COMPACT_PREVIEW_COUNT = 8;
/** Only the first two rows stagger in — later rows must appear instantly while scrolling. */
const STAGGER_ROW_LIMIT = 2;
/** enterStagger caps at 240ms + 320ms duration; after this the first paint is done. */
const FIRST_PAINT_WINDOW_MS = 700;
/** How long the "this one is new" ring stays on the freshly unlocked sticker. */
const HIGHLIGHT_DURATION_MS = 3600;
const PANEL_SURFACE = "rgba(255,255,255,0.62)";
const TILE_LOCKED_SURFACE = "rgba(255,255,255,0.58)";
const TILE_LOCKED_BORDER = "rgba(157,184,216,0.32)";
const COUNTER_SURFACE = "rgba(255,255,255,0.76)";
const PROGRESS_TRACK = "rgba(255,255,255,0.84)";
/** Gallery page geometry: screen margin, panel padding + hairline, column gap. */
const GALLERY_SCREEN_MARGIN = 16;
const GALLERY_PANEL_PADDING = 12;
const GALLERY_PANEL_BORDER = 1;
const GALLERY_COLUMN_GAP = 9;
/** Matches `rounded-card` (22) — the album page surface. */
const GALLERY_PANEL_RADIUS = 22;

type EnteringAnimation = React.ComponentProps<typeof Animated.View>["entering"];

const keyExtractor = (sticker: AnimalSticker) => sticker.id;

function getCellHeight(showThemeLabel: boolean) {
  return (
    TILE_BOX_HEIGHT +
    TILE_LABEL_GAP +
    TILE_LABEL_HEIGHT +
    (showThemeLabel ? TILE_LABEL_HEIGHT : 0)
  );
}

function formatDateLabel(value: string) {
  const [, month, day] = value.split("-");
  return day && month ? `${day}.${month}.` : value;
}

/**
 * The "you just unlocked this" pop. Mounted only for the single highlighted
 * tile, so the other ~97 tiles carry zero animated styles or shared values.
 */
function StickerUnlockPulse({
  accent,
  reduceMotion,
  children,
}: {
  accent: string;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      // Decorative pop is dropped; the ring still points at the new sticker.
      ring.value = 1;
      return;
    }

    scale.value = withDelay(
      140,
      withSequence(withSpring(1.16, springs.bouncy), withSpring(1, springs.playful))
    );
    ring.value = withSequence(
      withTiming(1, timings.fast),
      withDelay(1600, withTiming(0.5, timings.slow))
    );
  }, [reduceMotion, ring, scale]);

  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value }));

  return (
    <Animated.View style={[{ width: "100%", height: TILE_BOX_HEIGHT }, boxStyle]}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: -3,
            left: -3,
            right: -3,
            bottom: -3,
            borderRadius: 21,
            borderWidth: 2,
            borderColor: accent,
          },
          ringStyle,
        ]}
      />
    </Animated.View>
  );
}

interface StickerTileProps {
  sticker: AnimalSticker;
  entry?: StickerCollectionEntry;
  palette: ThemePalette;
  width: ViewStyle["width"];
  /** Second caption line (routine / theme world). Hidden in the compact preview. */
  showThemeLabel: boolean;
  /** Entrance builder — only supplied for the first rows of the first paint. */
  entering?: EnteringAnimation;
  /** expo-image cross-fade. Off for recycled cells so scrolling never ghosts. */
  fadeImage: boolean;
  /** Freshly unlocked sticker: pops once and wears a coloured ring. */
  highlighted?: boolean;
  /** Passed down instead of hooked per tile — one subscription per wall. */
  reduceMotion?: boolean;
}

/**
 * One wall slot. Memoized because the gallery re-renders it on every recycle —
 * the props are all primitives or stable references (palette + entry objects).
 */
const StickerTile = React.memo(function StickerTile({
  sticker,
  entry,
  palette,
  width,
  showThemeLabel,
  entering,
  fadeImage,
  highlighted = false,
  reduceMotion = false,
}: StickerTileProps) {
  const label = entry ? formatDateLabel(entry.earnedDate) : getStickerRarityLabel(sticker.rarity);
  const themeLabel = entry?.routineName ?? getStickerThemeWorldLabel(sticker.themeWorld);
  const accessibilityLabel = entry
    ? `${sticker.title}, gesammelt am ${label}`
    : `${sticker.title}, noch nicht gesammelt`;

  const box = (
    <View
      className="h-full w-full items-center justify-center rounded-tile border"
      style={{
        backgroundColor: entry ? `${sticker.accent}14` : TILE_LOCKED_SURFACE,
        borderColor: entry ? `${sticker.accent}55` : TILE_LOCKED_BORDER,
      }}
    >
      {entry ? (
        <Image
          source={sticker.asset}
          recyclingKey={sticker.id}
          style={{ width: TILE_IMAGE_SIZE, height: TILE_IMAGE_SIZE }}
          contentFit="contain"
          transition={fadeImage && !highlighted ? 160 : 0}
        />
      ) : (
        <Text className="text-lg font-headline text-muted-foreground">?</Text>
      )}
    </View>
  );

  return (
    <Animated.View
      accessible
      accessibilityLabel={accessibilityLabel}
      entering={entering}
      className="items-center"
      style={{
        width,
        height: getCellHeight(showThemeLabel),
        marginBottom: TILE_ROW_GAP,
      }}
    >
      {highlighted ? (
        <StickerUnlockPulse accent={sticker.accent} reduceMotion={reduceMotion}>
          {box}
        </StickerUnlockPulse>
      ) : (
        <View style={{ width: "100%", height: TILE_BOX_HEIGHT }}>{box}</View>
      )}

      {/* Fixed height + lineHeight: the row height must stay exact for getItemLayout. */}
      <Text
        className="mt-1 text-xs font-body-semibold"
        style={{
          height: TILE_LABEL_HEIGHT,
          lineHeight: TILE_LABEL_HEIGHT,
          color: entry ? palette.accentText : semanticColors.mutedForeground,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </Text>
      {showThemeLabel ? (
        <Text
          className="text-xs font-body text-muted-foreground"
          style={{ height: TILE_LABEL_HEIGHT, lineHeight: TILE_LABEL_HEIGHT }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          maxFontSizeMultiplier={1.2}
        >
          {themeLabel}
        </Text>
      ) : null}
    </Animated.View>
  );
});

interface StickerWallProps {
  entries: StickerCollectionEntry[];
  palette: ThemePalette;
  compact?: boolean;
  onOpenWall?: () => void;
}

/**
 * Embedded preview card (dashboard, star account, parent settings).
 * Renders a plain flex-wrap grid on purpose: it lives inside a ScrollView, so a
 * FlatList here would nest two virtualized lists. Use `StickerWallGallery` for
 * the full-screen album, which owns its own scroll container.
 */
export function StickerWall({
  entries,
  palette,
  compact = false,
  onOpenWall,
}: StickerWallProps) {
  const { width } = useWindowDimensions();
  const isCompactWidth = width < COMPACT_WIDTH_BREAKPOINT;
  const catalogStickers = compact
    ? STICKER_CATALOG.slice(0, COMPACT_PREVIEW_COUNT)
    : STICKER_CATALOG;
  const entriesByStickerId = useMemo(
    () => new Map(entries.map((entry) => [entry.stickerId, entry])),
    [entries]
  );
  const filledCount = entries.length;
  const totalCount = STICKER_CATALOG.length;
  const stickerTileWidth = isCompactWidth ? "31%" : "23%";

  return (
    <Animated.View entering={enterStagger(4)} className="mt-4">
      <Card
        className="overflow-hidden rounded-card px-4 py-4"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="absolute right-[-18px] top-[-18px] h-28 w-28 rounded-full"
          style={{ backgroundColor: palette.motifSecondary, opacity: 0.2 }}
        />
        <PressableScale
          disabled={!onOpenWall}
          onPress={onOpenWall}
          accessibilityRole={onOpenWall ? "button" : undefined}
          accessibilityLabel={onOpenWall ? "Sticker-Galerie öffnen" : undefined}
        >
          <View className={isCompactWidth ? "gap-3" : "flex-row items-start justify-between gap-3"}>
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View
                className="h-12 w-12 shrink-0 items-center justify-center rounded-tile"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Sparkles size={21} color={palette.accentStrong} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-lg font-headline text-foreground" numberOfLines={1}>
                  Sticker-Galerie
                </Text>
                <Text className="mt-1 text-base font-body leading-6 text-muted-foreground" numberOfLines={2}>
                  Sammle Sticker aus vielen Themenwelten nach geschafften Routinen.
                </Text>
              </View>
            </View>
            <View className="shrink-0 flex-row items-center gap-2">
              <View
                className="min-h-11 rounded-tile px-3 py-2"
                style={{ backgroundColor: COUNTER_SURFACE }}
              >
                <Text
                  className="text-xs font-body-semibold uppercase tracking-[0.6px] text-muted-foreground"
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                >
                  Gesammelt
                </Text>
                <Text className="mt-1 text-sm font-headline" style={{ color: palette.accentText }}>
                  {Math.min(filledCount, totalCount)}/{totalCount}
                </Text>
              </View>
              {onOpenWall ? (
                <View
                  className="h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <ChevronRight size={18} color={palette.accentStrong} />
                </View>
              ) : null}
            </View>
          </View>
        </PressableScale>

        <View
          className="mt-4 flex-row flex-wrap justify-between rounded-card border px-3 py-3"
          style={{ borderColor: palette.accentBorder, backgroundColor: PANEL_SURFACE }}
        >
          {catalogStickers.map((sticker) => (
            <StickerTile
              key={sticker.id}
              sticker={sticker}
              entry={entriesByStickerId.get(sticker.id)}
              palette={palette}
              width={stickerTileWidth}
              showThemeLabel={!compact}
              fadeImage
            />
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}

interface StickerWallGalleryProps {
  entries: StickerCollectionEntry[];
  palette: ThemePalette;
  /** Freshly unlocked sticker: scrolled into view and pulsed once on arrival. */
  highlightStickerId?: StickerAssetId | null;
  /** Extra padding under the last row (safe area / tab bar). */
  bottomInset?: number;
}

/**
 * Full-screen sticker gallery. This *is* the scroll container — never wrap it in
 * a ScrollView. The whole catalog (~98 tiles) is virtualized with a fixed row
 * height, so only the visible rows plus a small window are mounted.
 */
export function StickerWallGallery({
  entries,
  palette,
  highlightStickerId,
  bottomInset = 24,
}: StickerWallGalleryProps) {
  const { height, width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const listRef = useRef<FlatList<AnimalSticker>>(null);
  /** True only for the initial render pass: gates stagger + image cross-fade. */
  const firstPaintRef = useRef(true);
  const [activeHighlightId, setActiveHighlightId] = useState<StickerAssetId | null>(null);

  const columns = width < COMPACT_WIDTH_BREAKPOINT ? 3 : width < WIDE_WIDTH_BREAKPOINT ? 4 : 6;
  const rowHeight = getCellHeight(true) + TILE_ROW_GAP;
  // Point-based tile width (instead of the preview card's percentages) so the
  // partially filled last row stays left-aligned on the same column grid.
  const rowWidth =
    width -
    GALLERY_SCREEN_MARGIN * 2 -
    GALLERY_PANEL_PADDING * 2 -
    GALLERY_PANEL_BORDER * 2;
  const tileWidth = Math.floor(
    (rowWidth - GALLERY_COLUMN_GAP * (columns - 1)) / columns
  );

  const entriesByStickerId = useMemo(
    () => new Map(entries.map((entry) => [entry.stickerId, entry])),
    [entries]
  );
  const totalCount = STICKER_CATALOG.length;
  const filledCount = Math.min(entriesByStickerId.size, totalCount);
  const progressPercent = Math.round((filledCount / totalCount) * 100);

  useEffect(() => {
    const timeout = setTimeout(() => {
      firstPaintRef.current = false;
    }, FIRST_PAINT_WINDOW_MS);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!highlightStickerId) {
      setActiveHighlightId(null);
      return;
    }

    const stickerIndex = STICKER_CATALOG.findIndex(
      (sticker) => sticker.id === highlightStickerId
    );

    if (stickerIndex < 0) {
      return;
    }

    setActiveHighlightId(highlightStickerId);

    // FlatList indexes rows (not items) once numColumns > 1.
    const rowIndex = Math.floor(stickerIndex / columns);
    const rowCount = Math.ceil(STICKER_CATALOG.length / columns);
    const visibleRows = Math.max(1, Math.round((height - 220) / rowHeight));
    // Rows near the end are aligned to the bottom instead of a third down —
    // scrollToIndex does not clamp the upper bound, so this avoids an overscroll bounce.
    const viewPosition = rowCount - rowIndex > visibleRows + 1 ? 0.35 : 1;

    const scrollTimeout = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: rowIndex,
        viewPosition,
        animated: !reduceMotion,
      });
    }, 280);
    const clearHighlightTimeout = setTimeout(
      () => setActiveHighlightId(null),
      HIGHLIGHT_DURATION_MS
    );

    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(clearHighlightTimeout);
    };
  }, [columns, height, highlightStickerId, reduceMotion, rowHeight]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AnimalSticker>) => {
      const isFirstPaint = firstPaintRef.current;

      return (
        <StickerTile
          sticker={item}
          entry={entriesByStickerId.get(item.id)}
          palette={palette}
          width={tileWidth}
          showThemeLabel
          entering={
            isFirstPaint && index < columns * STAGGER_ROW_LIMIT
              ? enterStagger(index)
              : undefined
          }
          fadeImage={isFirstPaint}
          highlighted={item.id === activeHighlightId}
          reduceMotion={reduceMotion}
        />
      );
    },
    [activeHighlightId, columns, entriesByStickerId, palette, reduceMotion, tileWidth]
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<AnimalSticker> | null | undefined, rowIndex: number) => ({
      length: rowHeight,
      offset: rowHeight * rowIndex,
      index: rowIndex,
    }),
    [rowHeight]
  );

  const handleScrollToIndexFailed = useCallback(
    (info: { index: number }) => {
      listRef.current?.scrollToOffset({
        offset: info.index * rowHeight,
        animated: !reduceMotion,
      });
    },
    [reduceMotion, rowHeight]
  );

  const listHeader = (
    <Animated.View entering={enterFade()} className="mb-4 flex-row items-center gap-3">
      <View
        className="h-12 w-12 shrink-0 items-center justify-center rounded-tile"
        style={{ backgroundColor: palette.heroSurface }}
      >
        <Sparkles size={21} color={palette.accentStrong} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-lg font-headline text-foreground" numberOfLines={1}>
          Deine Sammlung
        </Text>
        <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground" numberOfLines={2}>
          {filledCount === 0
            ? "Noch leer — schaffe eine Routine und der erste Sticker landet hier."
            : "Jede geschaffte Routine bringt einen neuen Sticker."}
        </Text>
        <Progress
          value={progressPercent}
          className="mt-2 h-2.5"
          indicatorColor={palette.chartPrimary}
          trackStyle={{ backgroundColor: PROGRESS_TRACK }}
          accessibilityLabel={`${filledCount} von ${totalCount} Stickern gesammelt`}
        />
      </View>
      <View
        className="shrink-0 items-center rounded-chip px-3 py-2"
        style={{ backgroundColor: COUNTER_SURFACE }}
      >
        <Text
          className="text-xs font-body-semibold uppercase tracking-[0.6px] text-muted-foreground"
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          Gesammelt
        </Text>
        <View className="mt-1 flex-row items-center">
          <AnimatedNumber
            value={filledCount}
            textClassName="text-sm font-headline text-foreground"
            maxFontSizeMultiplier={1.2}
          />
          <Text className="text-sm font-headline text-foreground" maxFontSizeMultiplier={1.2}>
            /{totalCount}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <FlatList
      ref={listRef}
      // numColumns cannot change on the fly — remount the grid on rotation.
      key={`sticker-gallery-${columns}`}
      data={STICKER_CATALOG}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      extraData={activeHighlightId}
      numColumns={columns}
      columnWrapperStyle={{ gap: GALLERY_COLUMN_GAP }}
      ListHeaderComponent={listHeader}
      getItemLayout={getItemLayout}
      onScrollToIndexFailed={handleScrollToIndexFailed}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      updateCellsBatchingPeriod={60}
      windowSize={5}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, marginHorizontal: GALLERY_SCREEN_MARGIN }}
      contentContainerStyle={{
        paddingHorizontal: GALLERY_PANEL_PADDING,
        paddingTop: 14,
        paddingBottom: bottomInset,
        borderRadius: GALLERY_PANEL_RADIUS,
        borderWidth: GALLERY_PANEL_BORDER,
        borderColor: palette.accentBorder,
        backgroundColor: PANEL_SURFACE,
      }}
    />
  );
}
