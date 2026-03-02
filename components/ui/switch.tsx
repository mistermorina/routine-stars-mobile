import React from "react";
import { Switch as RNSwitch } from "react-native";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, disabled }: SwitchProps) {
  return (
    <RNSwitch
      value={checked}
      onValueChange={onCheckedChange}
      disabled={disabled}
      trackColor={{ false: "#E5E5E5", true: "#F3E5AB" }}
      thumbColor={checked ? "#FFD700" : "#FFFFFF"}
      ios_backgroundColor="#E5E5E5"
    />
  );
}
