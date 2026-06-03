import { readFileSync } from "node:fs";

const filePath = "components/routine-stars/task-timer-modal.tsx";
const source = readFileSync(filePath, "utf8");

const animatedPropsIndex = source.indexOf("const circleAnimatedProps = useAnimatedProps");
const circumferenceIndex = source.indexOf("const circumference =");

if (animatedPropsIndex === -1) {
  throw new Error("TaskTimerModal is missing circleAnimatedProps.");
}

if (circumferenceIndex === -1) {
  throw new Error("TaskTimerModal is missing circumference.");
}

if (circumferenceIndex > animatedPropsIndex) {
  throw new Error(
    "TaskTimerModal declares circumference after useAnimatedProps; this causes a TDZ crash on mount."
  );
}

console.log("TaskTimerModal geometry is declared before animated props.");
