import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import type { AnimalSticker } from "@/lib/animal-stickers";
import type { ThemePalette } from "@/lib/theme";

interface StickerRewardSheetProps {
  visible: boolean;
  childName: string;
  stickers: AnimalSticker[];
  palette: ThemePalette;
  onSelectSticker: (sticker: AnimalSticker) => void;
  onClose: () => void;
}

export function StickerRewardSheet({
  visible,
  childName,
  stickers,
  palette,
  onSelectSticker,
  onClose,
}: StickerRewardSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end px-4 pb-5" style={{ backgroundColor: "rgba(246,250,255,0.86)" }}>
        <View
          className="overflow-hidden rounded-[30px] border px-4 pb-5 pt-4"
          style={{
            backgroundColor: palette.cardTint,
            borderColor: palette.accentBorder,
            shadowColor: "#9DB8D8",
            shadowOpacity: 0.22,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 18 },
          }}
        >
          <View
            className="absolute inset-x-0 top-0 h-36 rounded-[30px]"
            style={{ backgroundColor: palette.heroSurface }}
          />
          <View
            className="absolute right-[-24px] top-[-24px] h-32 w-32 rounded-full"
            style={{ backgroundColor: palette.motifSecondary, opacity: 0.28 }}
          />

          <View className="relative">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <View
                  className="self-start rounded-full px-3 py-1.5"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.7px]" style={{ color: palette.accentText }}>
                    Tag geschafft
                  </Text>
                </View>
                <Text className="mt-3 text-[26px] font-headline leading-[31px] text-foreground">
                  Such dir einen Sticker aus
                </Text>
                <Text className="mt-2 text-sm font-body leading-5 text-muted-foreground">
                  {childName} hat heute alles geschafft. Dieser Sticker landet direkt auf der Sticker-Wall.
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
                accessibilityRole="button"
                accessibilityLabel="Sticker-Auswahl schließen"
              >
                <X size={20} color={palette.accentText} />
              </Pressable>
            </View>

            <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
              {stickers.slice(0, 6).map((sticker) => (
                <Pressable
                  key={sticker.id}
                  onPress={() => onSelectSticker(sticker)}
                  className="w-[48%] overflow-hidden rounded-[22px] border px-3 py-3 active:opacity-90"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.8)",
                    borderColor: palette.accentBorder,
                  }}
                >
                  <View
                    className="mx-auto h-24 w-24 items-center justify-center rounded-[24px]"
                    style={{ backgroundColor: `${sticker.accent}18` }}
                  >
                    <Image
                      source={sticker.asset}
                      style={{ width: 82, height: 82 }}
                      contentFit="contain"
                      transition={160}
                    />
                  </View>
                  <Text className="mt-3 text-center text-sm font-headline text-foreground" numberOfLines={1}>
                    {sticker.title}
                  </Text>
                  <Text className="mt-1 text-center text-xs font-body text-muted-foreground" numberOfLines={1}>
                    {sticker.mood}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
