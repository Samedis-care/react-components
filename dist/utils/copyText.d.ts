/**
 * Copy the given text. API is in WD state, comes with limitations.
 * Notably:
 * - Firefox only supports this on https sites
 * - Safari only supports this on user input events
 * - Does not work with IE
 * @param text The text to copy
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
 * @see https://caniuse.com/mdn-api_clipboard_writetext
 */
declare const copyText: (text: string) => Promise<void>;
export default copyText;
