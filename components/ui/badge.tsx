import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-primary",
  secondary: "bg-secondary",
  destructive: "bg-destructive",
  outline: "border border-border bg-transparent",
} as const;

const textVariants = {
  default: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  destructive: "text-destructive-foreground",
  outline: "text-foreground",
} as const;

export interface BadgeProps {
  variant?: keyof typeof badgeVariants;
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  className,
  textClassName,
  children,
}: BadgeProps) {
  return (
    <View
      className={cn(
        "rounded-full px-3 py-1",
        badgeVariants[variant],
        className
      )}
    >
      {typeof children === "string" ? (
        <Text className={cn("text-xs font-body-semibold", textVariants[variant], textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
