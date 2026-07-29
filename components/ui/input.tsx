import React, { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { semanticColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface InputProps extends TextInputProps {
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { className, style, ...props },
  ref
) {
  return (
    <TextInput
      ref={ref}
      className={cn(
        "h-12 w-full rounded-tile border border-input bg-card px-4 placeholder:text-muted-foreground",
        props.editable === false && "opacity-50",
        className
      )}
      // Fixed 48pt field: cap Dynamic Type so the text never clips the box.
      maxFontSizeMultiplier={1.3}
      style={[
        {
          fontFamily: "Inter_400Regular",
          fontSize: 16,
          color: semanticColors.foreground,
          letterSpacing: 0,
          lineHeight: 20,
          paddingVertical: 0,
        },
        style,
      ]}
      placeholderTextColor={semanticColors.mutedForeground}
      {...props}
    />
  );
});
