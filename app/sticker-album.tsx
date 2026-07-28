import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Award } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { useStickerWall } from "@/hooks/use-sticker-wall";
import { StickerWall } from "@/components/stickers/sticker-wall";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { getThemePalette } from "@/lib/theme";

export default function StickerAlbumScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId, isLoading } = useChildren();
  const { collectedEntries } = useStickerWall(selectedChildId);
  const palette = getThemePalette(selectedChild?.theme);

  if (isLoading) {
    return (
      <ThemedScreenBackground
        theme={selectedChild?.theme}
        backgroundSkin={selectedChild?.backgroundSkin}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center">
            <Text className="font-body text-muted-foreground">Laden...</Text>
          </View>
        </SafeAreaView>
      </ThemedScreenBackground>
    );
  }

  if (!selectedChild) {
    return (
      <ThemedScreenBackground>
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-xl font-headline text-foreground">
              Kein Profil gefunden
            </Text>
            <Text className="mt-2 text-center text-sm font-body text-muted-foreground">
              Erstelle zuerst ein Kinderprofil, um Sticker zu sammeln.
            </Text>
          </View>
        </SafeAreaView>
      </ThemedScreenBackground>
    );
  }

  return (
    <ThemedScreenBackground
      theme={selectedChild.theme}
      backgroundSkin={selectedChild.backgroundSkin}
    >
      <SafeAreaView className="flex-1">
        <View className="px-4 pb-3 pt-2">
          <View className="flex-row items-center justify-between gap-3">
            <Pressable
              onPress={() => router.back()}
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
              hitSlop={8}
            >
              <ArrowLeft size={22} color={palette.accentText} />
            </Pressable>

            <View className="flex-1">
              <Text className="text-center text-[28px] font-headline text-foreground">
                Sticker-Galerie
              </Text>
              <Text className="text-center text-sm font-body" style={{ color: palette.accentText }}>
                {selectedChild.name}s gesammelte Routine-Sticker
              </Text>
            </View>

            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Award size={20} color={palette.accentStrong} />
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <StickerWall
            entries={collectedEntries}
            palette={palette}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedScreenBackground>
  );
}
