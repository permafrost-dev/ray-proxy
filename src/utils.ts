/**
 * Formats bytes to kilobytes.
 *
 * @param bytes number
 * @param decimals number
 * @returns number
 */
export const formatPayloadSize = (bytes: number, decimals = 3): number => {
    return Number((bytes / 1024.0).toFixed(decimals));
};
