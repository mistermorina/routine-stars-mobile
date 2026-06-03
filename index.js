import { LogBox } from "react-native";
import "expo-router/entry";

if (__DEV__) {
  const message =
    "SafeAreaView has been deprecated and will be removed in a future release.";

  LogBox.ignoreLogs([message]);

  const originalWarn = console.warn;
  console.warn = (...args) => {
    const [first] = args;
    if (typeof first === "string" && first.startsWith(message)) {
      return;
    }

    originalWarn(...args);
  };
}
