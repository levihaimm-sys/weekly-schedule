/**
 * Sanitizes HTML content by removing inline styles and style-related attributes
 * This allows our CSS theme to properly style the content
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return '';

  let sanitized = html;

  // Remove all style attributes
  sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');

  // Remove background attributes
  sanitized = sanitized.replace(/\s*background\s*=\s*["'][^"']*["']/gi, '');

  // Remove bgcolor attributes
  sanitized = sanitized.replace(/\s*bgcolor\s*=\s*["'][^"']*["']/gi, '');

  // Remove color attributes
  sanitized = sanitized.replace(/\s*color\s*=\s*["'][^"']*["']/gi, '');

  // Remove width/height attributes from non-table elements to allow responsive sizing
  sanitized = sanitized.replace(/<(?!table|td|th)([a-z]+)([^>]*)\s*width\s*=\s*["'][^"']*["']/gi, '<$1$2');
  sanitized = sanitized.replace(/<(?!table|td|th)([a-z]+)([^>]*)\s*height\s*=\s*["'][^"']*["']/gi, '<$1$2');

  // Remove font tags and replace with spans
  sanitized = sanitized.replace(/<font[^>]*>/gi, '<span>');
  sanitized = sanitized.replace(/<\/font>/gi, '</span>');

  // Remove align attributes (we'll use CSS instead)
  sanitized = sanitized.replace(/\s*align\s*=\s*["'][^"']*["']/gi, '');

  // Clean up any empty style attributes that might remain
  sanitized = sanitized.replace(/\s*style\s*=\s*[""]["'']\s*[""]["'']/gi, '');

  // Remove duplicate lesson plan title headings like "מערך 4 - פתיחת שנה..."
  // Only remove h1-h6 tags that contain "מערך" followed by a number
  sanitized = sanitized.replace(/<h[1-6][^>]*>(?:[^<]|<(?!\/h))*?מערך\s*\d+(?:[^<]|<(?!\/h))*?<\/h[1-6]>/gi, '');

  // Remove small divs wrapping just the מערך heading (but not large content divs)
  sanitized = sanitized.replace(/<div[^>]*>\s*<h[1-6][^>]*>(?:[^<]|<(?!\/h))*?מערך\s*\d+(?:[^<]|<(?!\/h))*?<\/h[1-6]>\s*<\/div>/gi, '');

  // Remove "זמן מערך" / "זמן שיעור" headings specifically
  sanitized = sanitized.replace(/<h[1-6][^>]*>(?:[^<]|<(?!\/h))*?(?:⏱|🕐|⏰)?(?:[^<]|<(?!\/h))*?זמן\s*(?:מערך|שיעור)(?:[^<]|<(?!\/h))*?<\/h[1-6]>/gi, '');

  // Remove paragraphs or divs that ONLY contain duration like "45-60 דקות"
  sanitized = sanitized.replace(/<p[^>]*>\s*\d+[-–]\d+\s*דקות\s*<\/p>/gi, '');
  sanitized = sanitized.replace(/<div[^>]*>\s*\d+[-–]\d+\s*דקות\s*<\/div>/gi, '');

  // Remove "חותמת" headings and small sections
  sanitized = sanitized.replace(/<h[1-6][^>]*>(?:[^<]|<(?!\/h))*?חותמת(?:[^<]|<(?!\/h))*?<\/h[1-6]>/gi, '');
  sanitized = sanitized.replace(/<p[^>]*>(?:[^<]|<(?!\/p))*?חותמת(?:[^<]|<(?!\/p))*?<\/p>/gi, '');

  // Clean up empty containers left behind
  sanitized = sanitized.replace(/<div[^>]*>\s*<\/div>/gi, '');
  sanitized = sanitized.replace(/<p[^>]*>\s*<\/p>/gi, '');
  sanitized = sanitized.replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi, '');
  sanitized = sanitized.replace(/<span[^>]*>\s*<\/span>/gi, '');

  return sanitized;
}
