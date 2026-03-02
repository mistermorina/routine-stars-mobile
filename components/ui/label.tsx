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
      className={cn("text-sm font-body-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </Text>
  );
}
