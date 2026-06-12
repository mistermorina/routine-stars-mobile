import React, { createContext, useContext } from "react";
import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";

interface RadioGroupContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType>({
  value: "",
  onValueChange: () => {},
});

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function RadioGroup({
  value,
  onValueChange,
  className,
  children,
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <View className={cn("gap-3", className)}>{children}</View>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  className?: string;
  children?: React.ReactNode;
}

export function RadioGroupItem({ value, className }: RadioGroupItemProps) {
  const { value: selectedValue, onValueChange } = useContext(RadioGroupContext);
  const isSelected = selectedValue === value;

  return (
    <Pressable
      onPress={() => onValueChange(value)}
      className={cn(
        "h-11 w-11 items-center justify-center rounded-full",
        className
      )}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
    >
      <View
        className={cn(
          "h-5 w-5 items-center justify-center rounded-full border-2",
          isSelected ? "border-primary" : "border-input"
        )}
      >
        {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </View>
    </Pressable>
  );
}
