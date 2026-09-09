import DOMPurify from 'dompurify';

/**
 * Sanitize untrusted user-generated strings against XSS attacks.
 *
 * @param {string} dirty - The raw untrusted text/HTML string
 * @returns {string} - Clean, sanitized string safe for DOM rendering
 */
export const sanitizeText = (dirty) => {
  if (dirty === null || dirty === undefined) return '';
  if (typeof dirty !== 'string') return String(dirty);
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'span', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
};

/**
 * Mask sensitive phone number for privacy / anti-shoulder-surfing (e.g. +91 98••••••10)
 */
export const maskPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  const clean = phone.trim();
  if (clean.length <= 6) return clean;
  const start = clean.slice(0, 6);
  const end = clean.slice(-2);
  const bullets = '••••';
  return start + ' ' + bullets + ' ' + end;
};

/**
 * Mask sensitive email address (e.g. m•••••••@gmail.com)
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return name[0] + '•@' + domain;
  const maskedName = name[0] + '•••••' + name.slice(-1);
  return maskedName + '@' + domain;
};

export default {
  sanitizeText,
  maskPhoneNumber,
  maskEmail,
};
