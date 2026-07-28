import { KEYS, storage } from "@/lib/storage";

/**
 * Routine Stars is a local-only app: there is no account, no sign-in and no
 * server session. The only thing that decides where a cold start lands is what
 * already exists on this device.
 */
export type AuthRoute = "/(auth)/welcome" | "/(auth)/onboarding" | "/(tabs)";

/**
 * Cold-start destination:
 *   1. No child profile and the intro was never seen → welcome journey
 *   2. No child profile                              → setup wizard
 *   3. Otherwise                                     → the app
 *
 * The child check comes first on purpose: a device that already holds profiles
 * is never a first run, even if `HAS_SEEN_WELCOME` was written by an older
 * build (or not at all).
 */
export async function getInitialAuthRoute(): Promise<AuthRoute> {
  const children = await storage.getItem<unknown[]>(KEYS.CHILDREN);

  if (children && children.length > 0) {
    return "/(tabs)";
  }

  const hasSeenWelcome = await storage.getItem<boolean>(KEYS.HAS_SEEN_WELCOME);

  return hasSeenWelcome ? "/(auth)/onboarding" : "/(auth)/welcome";
}
