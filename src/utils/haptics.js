/**
 * Haptic Vibration Utility
 * Provides lightweight, crisp tactile feedback on mobile devices.
 */
export const vibrate = (pattern = 10) => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Vibration not supported or restricted by browser permissions
  }
};
