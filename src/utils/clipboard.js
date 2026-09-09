/**
 * Cross-browser, robust clipboard copy utility with automatic fallback.
 * Works seamlessly on localhost, HTTPS, local network IPs (e.g. 192.168.x.x),
 * and mobile web browsers where navigator.clipboard may be restricted.
 *
 * @param {string} text - The text string to copy
 * @returns {Promise<boolean>} - Resolves to true if successfully copied
 */
export const copyToClipboard = async (text) => {
  if (text === null || text === undefined) return false;
  const str = String(text);

  // 1. Try modern navigator.clipboard API if available and in secure context
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(str);
      return true;
    } catch (err) {
      console.warn('[Clipboard]: navigator.clipboard failed, attempting fallback:', err);
    }
  }

  // 2. Reliable DOM Fallback using execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = str;

    // Prevent scrolling and keep hidden
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    // Mobile / iOS Safari selection range
    textArea.setSelectionRange(0, str.length + 100);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return true;
    }
  } catch (fallbackErr) {
    console.error('[Clipboard]: Fallback execCommand failed:', fallbackErr);
  }

  return false;
};

export default copyToClipboard;
