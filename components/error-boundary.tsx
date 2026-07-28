import React from "react";
import { View } from "react-native";

import { ErrorState } from "@/components/ui/error-state";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Hook for logging/telemetry. Runs before the fallback is shown. */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render errors below it and shows a calm German fallback instead of a
 * white screen. Wraps the whole Stack in `app/_layout.tsx`; "Erneut versuchen"
 * clears the error and re-mounts the tree. Nothing is lost — all data lives in
 * AsyncStorage.
 *
 * Class component on purpose: React has no hook equivalent for error catching.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unbehandelter Render-Fehler:", error, info.componentStack);
    this.props.onError?.(error, info);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error !== null) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-6">
          <ErrorState
            className="w-full"
            title="Da ist etwas schiefgelaufen"
            description="Die App hat sich kurz verhakt. Deine Sterne sind gespeichert — versuche es einfach noch einmal."
            retryLabel="Erneut versuchen"
            onRetry={this.handleRetry}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
