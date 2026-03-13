/**
 * Utility functions for handling HTML content in articles
 */

/**
 * Strips HTML tags from a string
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  // First decode basic entities
  const decoded = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
    
  return decoded.replace(/<[^>]*>?/gm, '');
};

/**
 * Decodes HTML entities if they were double-encoded
 */
export const decodeHtml = (html: string): string => {
  if (!html) return '';
  // If the string starts with &lt; it's likely encoded
  if (html.includes('&lt;') || html.includes('&gt;')) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.documentElement.textContent || html;
  }
  return html;
};

/**
 * Checks if a string is a JSON (Editor.js format)
 */
export const isJson = (str: string): boolean => {
  if (!str) return false;
  try {
    const obj = JSON.parse(str);
    return !!obj && typeof obj === 'object';
  } catch (e) {
    return false;
  }
};
