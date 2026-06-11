import React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-primary active:bg-primary/80",
  destructive: "bg-destructive active:bg-destructive/80",
  outline: "border border-border bg-card active:bg-secondary",
  secondary: "bg-secondary active:bg-secondary/80",
  ghost: "active:bg-secondary",
  link: "",
} as const;

const buttonSizes = {
  default: "h-12 px-5 py-0",
  sm: "h-9 px-3 py-0",
  lg: "h-14 px-6 py-0",
  icon: "h-10 w-10",
} as const;

const textVariants = {
  default: "text-primary-foreground font-body-semibold text-base",
  destructive: "text-destructive-foreground font-body-semibold text-base",
  outline: "text-foreground font-body-semibold text-base",
  secondary: "text-secondary-foreground font-body-semibold text-base",
  ghost: "text-foreground font-body-semibold text-base",
  link: "text-primary font-body-semibold text-base underline",
} as const;

// Roomier line height centers Poppins glyphs inside the fixed-height button
// (tight line boxes make the ascender-heavy font sit visibly high).
const textSizes = {
  default: "text-base leading-[22px]",
  sm: "text-sm leading-[19px]",
  lg: "text-base leading-[22px]",
  icon: "text-base leading-[22px]",
} as const;

export interface ButtonProps extends PressableProps {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  className,
  textClassName,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        "flex-row items-center justify-center rounded-lg",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(
            textVariants[variant],
            textSizes[size],
            textClassName
          )}
          style={{ includeFontPadding: false }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
