import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  type ModalProps,
  KeyboardAvoidingView,
  Platform,
  type ViewStyle,
} from "react-native";
import { cn } from "@/lib/utils";
import { X } from "lucide-react-native";

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: ModalProps["animationType"];
}

export function Dialog({
  visible,
  onClose,
  children,
  animationType = "fade",
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50"
          onPress={onClose}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function DialogContent({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      className={cn(
        "mx-6 w-[340px] max-w-[90%] rounded-2xl bg-card p-6 shadow-lg",
        className
      )}
      style={style}
    >
      {children}
    </View>
  );
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <View className={cn("mb-4", className)}>{children}</View>;
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Text className={cn("text-xl font-headline text-card-foreground", className)}>
      {children}
    </Text>
  );
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Text className={cn("text-sm text-muted-foreground font-body mt-1", className)}>
      {children}
    </Text>
  );
}

export function DialogClose({
  onClose,
  className,
}: {
  onClose: () => void;
  className?: string;
}) {
  return (
    <Pressable
      className={cn("absolute right-4 top-4 p-1", className)}
      onPress={onClose}
      hitSlop={8}
    >
      <X size={20} color="#737373" />
    </Pressable>
  );
}
