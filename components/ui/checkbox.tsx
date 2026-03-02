import React from "react";
import { Pressable, View } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onCheckedChange,
  className,
  disabled,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "h-6 w-6 items-center justify-center rounded-md border-2",
        checked ? "border-primary bg-primary" : "border-input bg-card",
        disabled && "opacity-50",
        className
      )}
      hitSlop={8}
    >
      {checked && <Check size={14} color="#1a1a2e" strokeWidth={3} />}
    </Pressable>
  );
}
