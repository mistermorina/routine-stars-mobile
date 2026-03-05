import React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

export interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className, style, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "h-12 w-full rounded-lg border border-input bg-card px-4 placeholder:text-muted-foreground",
        props.editable === false && "opacity-50",
        className
      )}
      style={[
        {
          fontFamily: "Poppins_400Regular",
          fontSize: 16,
          color: "#1a1a2e",
          letterSpacing: 0,
          lineHeight: 20,
          paddingVertical: 0,
        },
        style,
      ]}
      placeholderTextColor="#737373"
      {...props}
    />
  );
}
