import React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

export interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "h-12 w-full rounded-lg border border-input bg-card px-4 text-base text-foreground font-body placeholder:text-muted-foreground",
        props.editable === false && "opacity-50",
        className
      )}
      placeholderTextColor="#737373"
      {...props}
    />
  );
}
