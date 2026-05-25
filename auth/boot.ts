import { useOSStore } from "../store/useOSStore";

export enum BootState {
  FIRST_BOOT = "FIRST_BOOT",
  LOCK_SCREEN = "LOCK_SCREEN",
  DESKTOP = "DESKTOP",
}

/**
 * Determines which UI should be shown when the OS starts.
 *   - No stored user → FIRST_BOOT (registration screen)
 *   - User exists but not logged in → LOCK_SCREEN
 *   - User exists and logged in → DESKTOP
 */
export const getBootState = (): BootState => {
  const { user, isLoggedIn } = useOSStore.getState();

  if (!user) {
    return BootState.FIRST_BOOT;
  }
  return isLoggedIn ? BootState.DESKTOP : BootState.LOCK_SCREEN;
};
