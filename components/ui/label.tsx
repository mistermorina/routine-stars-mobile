import React from "react";
import { Text, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

export interface LabelProps extends TextProps {
  className?: string;
  children: React.ReactNode;
}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <Text
      className={cn("text-base font-body-semibold leading-6 text-foreground", className)}
      numberOfLines={1}
      // Single-line by design — cap Dynamic Type so the label truncates late.
      maxFontSizeMultiplier={1.4}
      {...props}
    >
      {children}
    </Text>
  );
}
