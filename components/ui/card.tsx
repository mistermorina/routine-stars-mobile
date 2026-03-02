import React from "react";
import { View, Text, type TextStyle } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <View className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      {children}
    </View>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <View className={cn("mb-3", className)}>
      {children}
    </View>
  );
}

export function CardTitle({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: TextStyle;
}) {
  return (
    <Text className={cn("text-xl font-headline text-card-foreground", className)} style={style}>
      {children}
    </Text>
  );
}

export function CardDescription({
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

export function CardContent({ className, children }: CardProps) {
  return <View className={cn("", className)}>{children}</View>;
}

export function CardFooter({ className, children }: CardProps) {
  return (
    <View className={cn("flex-row items-center mt-4 pt-4", className)}>
      {children}
    </View>
  );
}
