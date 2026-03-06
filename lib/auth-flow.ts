import { KEYS, storage } from "@/lib/storage";

export type AuthRoute =
  | "/(auth)/welcome"
  | "/(auth)/login"
  | "/(auth)/onboarding"
  | "/(tabs)";

export async function getInitialAuthRoute(): Promise<AuthRoute> {
  const hasOnboarded = await storage.getItem<boolean>(KEYS.HAS_ONBOARDED);
  const children = await storage.getItem<unknown[]>(KEYS.CHILDREN);
  const hasSeenWelcome = await storage.getItem<boolean>(KEYS.HAS_SEEN_WELCOME);

  if (hasOnboarded === false) {
    return "/(auth)/onboarding";
  }

  if (children && children.length > 0) {
    return "/(tabs)";
  }

  if (!hasSeenWelcome) {
    return "/(auth)/welcome";
  }

  return "/(auth)/login";
}

export async function getPostAuthRoute(): Promise<AuthRoute> {
  const hasOnboarded = await storage.getItem<boolean>(KEYS.HAS_ONBOARDED);
  const children = await storage.getItem<unknown[]>(KEYS.CHILDREN);

  if (hasOnboarded === false) {
    return "/(auth)/onboarding";
  }

  if (children && children.length > 0) {
    return "/(tabs)";
  }

  return "/(auth)/onboarding";
}
