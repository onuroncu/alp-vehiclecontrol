import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx support.
 * Standard shadcn/ui utility.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Check if running inside FiveM NUI environment.
 * When running in a browser for development, invokeNative won't exist.
 */
export function isEnvBrowser() {
  return !(window.invokeNative);
}

/**
 * Post a message to the Lua client via NUI callback.
 * In dev mode (browser), returns a resolved promise with mock data.
 *
 * @param {string} event - The NUI callback name registered in Lua.
 * @param {object} data - Data to send to the Lua callback.
 * @returns {Promise<any>}
 */
export async function postNUI(event, data = {}) {
  if (isEnvBrowser()) {
    console.log(`[NUI:DEV] postNUI('${event}')`, data);
    return {};
  }

  const resourceName = (window).GetParentResourceName
    ? (window).GetParentResourceName()
    : 'af-vehiclecontrol';

  try {
    const resp = await fetch(`https://${resourceName}/${event}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(data),
    });
    return await resp.json();
  } catch (err) {
    console.error(`[NUI] postNUI error for '${event}':`, err);
    return null;
  }
}
