import { useChildrenContext } from "@/contexts/children-context";

/**
 * Child normalization stays part of this module's contract even though the
 * implementation moved into the provider: `normalizeChild` runs
 * `normalizeAvatarValue`, `normalizeBackgroundSkin` and `normalizeChildTheme`
 * on every read from and write to storage.
 */
export { normalizeChild } from "@/contexts/children-context";
export type { ChildrenContextValue } from "@/contexts/children-context";

/**
 * Reads the shared child roster from `ChildrenProvider` (mounted in
 * `app/_layout.tsx`).
 *
 * The state used to live here, which gave every screen its own copy — awarding
 * a star on the dashboard left the rewards tab stale because expo-router keeps
 * all tab screens mounted. Now every consumer sees the same object; call
 * `reload()` after writing the children key outside of these mutators.
 */
export function useChildren() {
  return useChildrenContext();
}
