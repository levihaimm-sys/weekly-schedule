// Remembers the last teacher name that signed at each location, on this device only.
// localStorage is synchronous and local, so it never delays the signing flow.

const PREFIX = "last-signer:";

export function getLastSigner(locationKey: string | undefined): string {
  if (!locationKey) return "";
  try {
    return localStorage.getItem(PREFIX + locationKey) ?? "";
  } catch {
    return "";
  }
}

export function saveLastSigner(locationKey: string | undefined, name: string) {
  if (!locationKey || !name.trim()) return;
  try {
    localStorage.setItem(PREFIX + locationKey, name.trim());
  } catch {
    // Storage unavailable (private mode etc.) - ignore
  }
}
