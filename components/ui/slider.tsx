import React from "react";
import RNSlider from "@react-native-community/slider";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: SliderProps) {
  return (
    <RNSlider
      value={value}
      onValueChange={onValueChange}
      minimumValue={min}
      maximumValue={max}
      step={step}
      minimumTrackTintColor="#F3E5AB"
      maximumTrackTintColor="#E5E5E5"
      thumbTintColor="#FFD700"
      style={{ width: "100%", height: 40 }}
    />
  );
}
